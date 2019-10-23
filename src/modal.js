import { createElement, querySelectorParent } from "@deleteagency/dom-helper";

class Modal {
    constructor(content, options = {}, service) {
        this._content = content;
        this._service = service;
        this._isOpened = false;
        this.element = null;

        this.options = { ...this.getDefaultOptions(), ...options };

        this.close = this.close.bind(this);
        this._onKeydown = this._onKeydown.bind(this);
    }

    getDefaultOptions() {
        return {
            destroyOnClose: false,
            onClose: null,
            onOpen: null
        };
    }

    open() {
        this._service.open(this);
    }

    close() {
        this._service.close(this);
    }

    _init() {
        this.closeElements = [...this.element.querySelectorAll(`[${this._service.options.namespace}-close]`)];
        this.wrapperElement = this.element.querySelector(`[${this._service.options.namespace}-wrapper]`);
    }

    _onOpen() {
        this._addListeners();
        if (this.options.onOpen) {
            this.options.onOpen();
        }
        this._isOpened = true;
        return new Promise((resolve) => {
            // first animation workaround
            setTimeout(() => {
                // check because might be destroyed
                if (this._isOpened && this.element) {
                    this.element.classList.add(this._service.options.classIsOpened);
                    this.element.style['-webkit-overflow-scrolling'] = 'touch';
                    this.element.removeAttribute('aria-hidden');
                    resolve();
                }
            }, 0);
        });
    }

    _onClose() {
        this.element.style['-webkit-overflow-scrolling'] = 'auto';
        this.element.classList.remove(this._service.options.classIsOpened);
        this.element.classList.add(this._service.options.classIsClosing);
        this.element.setAttribute('aria-hidden', 'true');
        this._removeListeners();

        if (this.options.onClose) {
            this.options.onClose();
        }
        this._isOpened = false;

        return new Promise(resolve => {
            setTimeout(() => {
                // check because might be destroyed
                if (this.element) {
                    this.element.classList.remove(this._service.options.classIsClosing);
                    if (this.options.destroyOnClose) {
                        this.destroy();
                    }
                }
                resolve();
            }, 300);
        });
    }

    destroy() {
        this._service.close(this);
        if (this.element) {
            this._service.destroy(this);
        }
    }

    _onDestroy() {
        this.element.parentNode.removeChild(this.element);
        this.element = null;
    }

    _addListeners() {
        if (this.closeElements) {
            this.closeElements.forEach(el => el.addEventListener('click', this.close));
        }

        document.addEventListener('keydown', this._onKeydown);
    }

    _removeListeners() {
        if (this.closeElements) {
            this.closeElements.forEach(el => el.removeEventListener('click', this.close));
        }

        document.removeEventListener('keydown', this._onKeydown);
    }

    _onKeydown(e) {
        if (e.keyCode === 27) {
            this.close();
        }
    }

    _getWrapperElement() {
        return this.wrapperElement;
    }
}


class ModalService {
    constructor() {
        this.openedModal = null;
        this.defaultOptions = {
            namespace: 'data-modal',
            onModalInit: null,
            onBeforeFirstModalOpen: null,
            onAfterLastModalClose: null,
            onModalDestroy: null,
            container: null,
            defaultModalTemplate: (modalOptions) => {
                return `<div data-modal aria-hidden="true">
                            <div data-modal-wrapper>
                                <div data-modal-content>
                                
                                </div>
                                <button data-modal-close>
                                    Close
                                 </button>
                            </div>
                        </div>`
            },
            classIsOpened: 'is-opened',
            classIsClosing: 'is-closing',
        };
        this.options = this.defaultOptions;
        this._setOuterHandler();
    }

    _setOuterHandler() {
        document.addEventListener('touchstart', this._outerClickHandle.bind(this));
        document.addEventListener('click', this._outerClickHandle.bind(this));
    }

    _outerClickHandle(e) {
        if (this.openedModal) {
            if (this.openedModal.element.contains(e.target)) {
                if (!this.openedModal._getWrapperElement().contains(e.target)) {
                    this.closeOpened();
                }
            }
        }
    }

    init(options = {}) {
        this.options = { ...this.defaultOptions, ...options };
        this._setOuterHandler();
    }

    create(content, options) {
        return new Modal(content, options, this);
    }

    /**
     * @param {String|HTMLElement} content
     * @param {Object} modalOptions
     * @return {HTMLElement}
     */
    _createModalElement(content, modalOptions) {
        let element = typeof content === 'string' ? createElement(content) : content;

        if (!element) {
            throw new Error('Content argument of the create method must be either a HTMLElement or a string with valid html markup');
        }

        // if we have already created modal element previously we want to find data-modal (or custom namespace attribute)
        // instead of modal content
        const actualModal = querySelectorParent(element, `[${this.options.namespace}]`, true);
        if (actualModal) {
            element = actualModal;
        } else {
            // if current element in not a actual modal node but its content
            const modalElement = createElement(this.options.defaultModalTemplate(modalOptions));
            const modalContentHolder = modalElement.querySelector(`[${this.options.namespace}-content]`);
            modalContentHolder.insertAdjacentElement('beforeend', element);
            element = modalElement;
        }

        if (element.parentNode === null || element.ownerDocument !== document) {
            this._getContainer().insertAdjacentElement('beforeend', element);
        }

        return element;
    }

    _getContainer() {
        return this.options.container || document.body;
    }

    /**
     * @param {Modal} modal
     */
    open(modal) {
        if (this.openedModal === modal) {
            return;
        }

        if (this.openedModal === null) {
            if (this.options.onBeforeFirstModalOpen) {
                this.options.onBeforeFirstModalOpen(modal);
            }
        }

        if (modal.element === null) {
            modal.element = this._createModalElement(modal._content, modal.options);
            modal._init(this.options);
            if (this.options.onModalInit) {
                this.options.onModalInit(modal);
            }
        }

        // first lets close opened one
        if (this.openedModal) {
            this.openedModal._onClose();
        }
        modal._onOpen();

        this.openedModal = modal;
    }

    close(modal) {
        if (this.openedModal && this.openedModal === modal) {
            modal._onClose().then(() => {
                if (this.options.onAfterLastModalClose) {
                    this.options.onAfterLastModalClose(modal);
                }
            });
            this.openedModal = null;
        }
    }

    destroy(modal) {
        // call custom callback first in order to allow accessing of modal root element
        if (this.options.onModalDestroy) {
            this.options.onModalDestroy(modal);
        }
        // call modal._onDestroy which actually destroys the modal root element
        modal._onDestroy();
    }

    closeOpened() {
        if (this.openedModal) {
            this.openedModal.close();
        }
    }
}

const instance = new ModalService();
export default instance;

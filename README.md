# Modal

[Live Demo](https://delete-agency.github.io/modal/)

## Motivation

TODO 

## Installation

Use the package manager [npm](https://docs.npmjs.com/about-npm/) for installation.

```
$ npm install @deleteagency/modal
```

## Usage

you can import ready instance

```js
import { modalService } from  '@deleteagency/modal';

const modal = modalService.create('<div>I am a modal!</div>');
modal.open();
```

or you can import class and modify it for your project, and then use

```js
import { ModalService } from '@deleteagency/modal';

class customModalService extend ModalService {
	...
}

const myService = new customModalService();
```

## Options

### namespace

Type: `String`<br>
Default: `data-modal`

TODO

## API

### Modal.create(content, options)

Returns new Modal instance

#### content

*Required*<br>
Type: `HTMLElement|String`

#### options

*Optional*<br>
Type: `Object`

## License
[MIT](https://choosealicense.com/licenses/mit/)
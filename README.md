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

```js
import Modal from  '@deleteagency/modal';

const modal = Modal.create('<div>I am a modal!</div>');
modal.open();
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
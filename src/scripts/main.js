"use strict";

import Promise from 'core-js-pure/actual/promise/index.js'

const clog = (ext = '.js') => console.log('main'+ext);
clog();

(new Promise(res => {
	setTimeout(res, 1000)
})).then(() => console.log('resolved'))
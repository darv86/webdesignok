"use strict";

// import Promise from 'core-js-pure/actual/promise/index.js'
import _ from 'lodash/lodash.min.js'
import path from 'path'
import fs from 'fs'

// (new Promise(res => {
// 	setTimeout(res, 1000)
// })).then(() => console.log('resolved'))

let langContent = fs.readdirSync('src/content').map(el => path.parse(el).name)

console.log(langContent);


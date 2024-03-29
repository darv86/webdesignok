'use strict';

// import Promise from 'core-js-pure/actual/promise/index.js'
import { Naviator } from './blocks/nav.js';
import { Selector } from './blocks/select.js';

const nav = document.querySelector('.nav');
const navToggler = document.querySelector('.nav-toggler');
const naviator = new Naviator(nav, navToggler);
naviator.init();

const select = document.querySelector('.nav-langs');
const selector = new Selector(select);
selector.init();

'use strict';

// import Promise from 'core-js-pure/actual/promise/index.js'
import { Naviator } from './blocks/nav.js';
import { Selector } from './blocks/select.js';
import { Scrolluper } from './blocks/scrollup.js';

const nav = document.querySelector('.nav');
const navToggler = document.querySelector('.nav-toggler');
const naviator = new Naviator(nav, navToggler);
naviator.init();

const select = document.querySelector('.nav-langs');
const selector = new Selector(select);
selector.init();

const scrollup = document.querySelector('.scrollup');
const scrolluper = new Scrolluper(scrollup, { behavior: 'auto' });
scrolluper.init();

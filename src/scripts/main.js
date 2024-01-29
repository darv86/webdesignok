// ts-nocheck
'use strict';

// import Promise from 'core-js-pure/actual/promise/index.js'

const navToggler = document.querySelector('.nav-toggler');
navToggler.addEventListener('click', function (e) {
	this.hasAttribute('data-opened')
		? this.removeAttribute('data-opened')
		: this.setAttribute('data-opened', '');
});

window.addEventListener('click', function (e) {
	const nav = e.target;
	if (nav instanceof HTMLElement && !nav.closest('.nav')) {
		navToggler.removeAttribute('data-opened');
	}
});

window.addEventListener('keyup', function (e) {
	if (navToggler.hasAttribute('data-opened') && e.code === 'Escape') {
		navToggler.removeAttribute('data-opened');
	}
});

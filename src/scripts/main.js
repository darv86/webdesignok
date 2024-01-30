// ts-nocheck
'use strict';

// import Promise from 'core-js-pure/actual/promise/index.js'

const navToggler = document.querySelector('.nav-toggler');
navToggler.addEventListener('click', function (e) {
	this.hasAttribute('data-isopen')
		? this.removeAttribute('data-isopen')
		: this.setAttribute('data-isopen', '');
});
window.addEventListener('click', function (e) {
	const nav = e.target;
	if (nav instanceof HTMLElement && !nav.closest('.nav')) {
		navToggler.removeAttribute('data-isopen');
	}
});
window.addEventListener('keyup', function (e) {
	if (navToggler.hasAttribute('data-isopen') && e.code === 'Escape') {
		navToggler.removeAttribute('data-isopen');
	}
});

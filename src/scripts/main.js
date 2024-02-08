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

class Selector {
	static #idCache = [];

	/**
	 * @param {Element} select
	 * @param {Object} [settings={}]
	 */
	constructor(select, settings = {}) {
		// const {showElement, shownLabel, shownInput, optionsBox} = settings
		this.settings = settings;
		this.select = select;
	}

	/**
	 * @param {string} str - html element className
	 * @returns {number}
	 */
	#getIdFromString(str) {
		const cache = Selector.#idCache;
		const string = str || 'a';
		let id = Math.floor((string.codePointAt(0) / Math.PI) * Math.PI);

		while (cache.includes(id)) id++;

		cache.push(id);

		return id;
	}

	/**
	 * @param {Element} element - html element
	 * @returns {Array.<Element>}
	 */
	#getOptions(element) {
		const options = [];

		if (element.hasAttribute('data-option')) options.push(element);
		for (const child of element.children) options.push(...this.#getOptions(child));

		return options;
	}

	/**
	 * @returns {Array.<Element>}
	 */
	#getSelected() {
		return this.#getOptions(this.select).filter(option => option.hasAttribute('data-selected'));
	}

	/**
	 * @param {( Element|Array.<Element> )} selected
	 */
	#showSelected(selected) {
		const selectedOptions = selected instanceof Element ? [selected] : [...selected];
		let showElement = this.select.querySelector('[data-show]');

		if (!showElement) {
			showElement = document.createElement('div');
			showElement.classList.add(this.settings.showElement.className);
			this.select.prepend(showElement);
		}

		for (const selectedOption of selectedOptions) {
			if (selectedOption.hasAttribute('data-value')) {
			}
			const input = document.createElement('input');
			const inputId = this.#getIdFromString(selectedOption.className);
			const inputAttrs = {
				['id']: `${inputId}`,
				['value']: selectedOption.hasAttribute('data-value')
					? selectedOption.getAttribute('data-value')
					: null,
				['hidden']: '',
			};
			for (const [attrName, attrValue] of Object.entries(inputAttrs)) {
				if (attrValue !== null && attrValue !== undefined) {
					input.setAttribute(attrName, attrValue);
				}

				if (this.settings.shownInput.className) {
					input.classList.add(this.settings.shownInput.className);
				}
			}

			const label = document.createElement('label');
			label.setAttribute('for', `${inputId}`);
			label.textContent = selectedOption.textContent;

			if (this.settings.shownLabel.className) {
				label.classList.add(this.settings.shownLabel.className);
			}

			showElement.append(input);
			showElement.append(label);
		}
	}

	#setOptionsBox() {
		const topLevelOption = this.select.querySelector('[data-option]');

		if (!topLevelOption.parentElement.hasAttribute('data-select')) return;

		const optionsBox = document.createElement('div');
		optionsBox.classList.add(this.settings.optionsBox.className);
		this.select.append(optionsBox);

		const options = Array.from(this.select.children).filter(option =>
			option.hasAttribute('data-option')
		);
		optionsBox.append(...options);
	}

	init() {
		this.#showSelected(this.#getSelected());
		this.#setOptionsBox();
	}
}

const select = document.querySelector('.nav-langs-select');
const selector = new Selector(select, {
	showElement: {
		className: 'nav-langs-select__show',
	},
	shownLabel: {
		className: 'shown-label',
	},
	shownInput: {
		className: '',
	},
	optionsBox: {
		className: 'nav-langs-select__options',
	},
});

selector.init();

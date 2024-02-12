// ts-nocheck
'use strict';

// import Promise from 'core-js-pure/actual/promise/index.js'

const navToggler = document.querySelector('.nav-toggler');
navToggler.addEventListener('click', function (e) {
	this.hasAttribute('data-isopen')
		? this.removeAttribute('data-isopen')
		: this.setAttribute('data-isopen', '');
});
navToggler.addEventListener('keyup', function (e) {
	// @ts-ignore
	if (navToggler.hasAttribute('data-isopen') && e.code === 'Escape') {
		navToggler.removeAttribute('data-isopen');
	}
});
window.addEventListener('click', function (e) {
	/** @type {Element} */
	// @ts-ignore
	const nav = e.target;

	if (!nav.closest('.nav')) {
		navToggler.removeAttribute('data-isopen');
	}
});

class Selector {
	static #idCache = [];
	#elementCache = new Map();

	/**
	 * @param {Element} select
	 * @param {Object} [settings={}]
	 */
	constructor(select, settings = {}) {
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

	/** @returns {Array.<Element>} */
	#getOptions() {
		return Array.from(this.select.querySelectorAll('[data-option]'));
	}

	/** @returns {Array.<Element>} */
	#getSelected() {
		return this.#getOptions().filter(option => option.hasAttribute('data-selected'));
	}

	#setOpener() {
		const showerBtn = this.select.querySelector('[data-shower-btn]');
		const optionsBox = this.select.querySelector('[data-options]');

		addEventListener('click', e => {
			/** @type {Element} */
			// @ts-ignore
			const target = e.target;

			if (!target.closest('[data-options]')) {
				showerBtn.removeAttribute('data-isopen');
				optionsBox.removeAttribute('data-isopen');
			}
		});

		this.select.addEventListener('isclose', e => {
			showerBtn.removeAttribute('data-isopen');
			optionsBox.removeAttribute('data-isopen');
		});

		showerBtn.addEventListener('click', e => {
			/** @type {Element} */
			// @ts-ignore
			const thisis = e.currentTarget;

			e.stopPropagation();

			if (thisis.hasAttribute('data-isopen')) {
				thisis.removeAttribute('data-isopen');
				optionsBox.removeAttribute('data-isopen');
			} else {
				thisis.setAttribute('data-isopen', '');
				optionsBox.setAttribute('data-isopen', '');
			}
		});
	}

	/**
	 * @param {Element} element
	 * @returns {Element}
	 */
	#setShowerElement(element) {
		const button = document.createElement('button');
		const selectedBox = this.#setShowerResult();
		const showerElement = element || button;
		const showerElementBtn = showerElement.tagName === 'BUTTON' ? showerElement : button;
		const showerElementBtnClassName = this.settings.showerElementBtn?.className;

		if (!showerElementBtn.classList.length) {
			showerElementBtnClassName && showerElementBtn.classList.add(showerElementBtnClassName);
		}

		if (showerElement !== showerElementBtn) {
			showerElement.append(showerElementBtn);
		}

		showerElementBtn.setAttribute('data-shower-btn', '');
		showerElementBtn.append(selectedBox);

		if (showerElement.hasAttribute('data-shower')) return selectedBox;

		showerElement.setAttribute('data-shower', '');

		this.select.prepend(showerElement);

		return selectedBox;
	}

	#setShowerResult() {
		const showerResult = document.createElement('div');
		const showerResultClassName = this.settings.showerResult?.className;

		showerResultClassName && showerResult.classList.add(showerResultClassName);
		showerResult.setAttribute('data-shower-result', '');

		return showerResult;
	}

	#setOptionsBox() {
		const topLevelOption = this.select.querySelector('[data-option]');
		const optionBoxClassName = this.settings.optionBox?.className;

		if (!topLevelOption.parentElement.hasAttribute('data-select')) {
			topLevelOption.parentElement.setAttribute('data-options', '');

			return;
		}

		const optionsBox = document.createElement('div');

		optionBoxClassName && optionsBox.classList.add(optionBoxClassName);
		optionsBox.setAttribute('data-options', '');

		this.select.append(optionsBox);

		const options = Array.from(this.select.children).filter(option =>
			option.hasAttribute('data-option')
		);

		optionsBox.append(...options);
	}

	#setElementCache() {
		const options = this.#getOptions();
		const labelClassName = this.settings.shownLabel?.className;
		const inputClassName = this.settings.shownInput?.className;

		for (const option of options) {
			if (option.hasAttribute('data-value')) {
				const input = document.createElement('input');
				const inputId = this.#getIdFromString(option.className);
				const inputAttrs = {
					['id']: `${inputId}`,
					['value']: option.getAttribute('data-value'),
					['hidden']: '',
					['disabled']: '',
				};

				for (const [attrName, attrValue] of Object.entries(inputAttrs)) {
					if (attrValue !== null && attrValue !== undefined) {
						input.setAttribute(attrName, attrValue);
					}

					inputClassName && input.classList.add(inputClassName);
				}

				const label = document.createElement('label');

				label.setAttribute('for', `${inputId}`);
				label.textContent = option.textContent;
				labelClassName && label.classList.add(labelClassName);

				if (this.#elementCache.has(option) || option.tagName === 'LINK') continue;

				this.#elementCache.set(option, { label, input });
			} else {
				const span = document.createElement('span');

				span.textContent = option.textContent;
				labelClassName && span.classList.add(labelClassName);

				if (this.#elementCache.has(option) || option.tagName === 'LINK') continue;

				this.#elementCache.set(option, { span });
			}
		}
	}

	/**
	 * @param {Array.<Element>} selectedOptions
	 * @param {Element} showerElement
	 */
	#insertSelected(selectedOptions, showerElement) {
		for (const selectedOption of selectedOptions) {
			if (selectedOption.hasAttribute('data-value')) {
				showerElement.append(this.#elementCache.get(selectedOption).label);
				showerElement.append(this.#elementCache.get(selectedOption).input);
			} else {
				showerElement.append(this.#elementCache.get(selectedOption).span);
			}
		}
	}

	/** @param {( Element|Array.<Element> )} selected */
	#showSelected(selected) {
		const selectedOptions = selected instanceof Element ? [selected] : [...selected];
		const showerElement = this.#setShowerElement(this.select.querySelector('[data-shower]'));
		this.#insertSelected(selectedOptions, showerElement);
	}

	#setSelectedPicker() {
		const optionsBox = this.select.querySelector('[data-options]');

		optionsBox.addEventListener('click', e => {
			// this.select.addEventListener('click', e => {
			/** @type {Element} */
			// @ts-ignore
			const select = e.currentTarget;
			/** @type {Element} */
			// @ts-ignore
			const option = e.target;
			const selectedBox = this.select.querySelector('[data-shower-result]');

			if (!option.hasAttribute('data-option') || option.tagName === 'LINK') return;

			if (!this.settings.multiple) {
				for (const option of this.#getSelected()) option.removeAttribute('data-selected');

				option.dispatchEvent(new CustomEvent('isclose', { bubbles: true }));
			}

			selectedBox.innerHTML = '';

			option.hasAttribute('data-selected') && [...this.#getSelected()].length > 1
				? option.removeAttribute('data-selected')
				: option.setAttribute('data-selected', '');

			this.#insertSelected(this.#getSelected(), selectedBox);
		});
	}

	init() {
		this.#setElementCache();
		this.#showSelected(this.#getSelected());
		this.#setOptionsBox();
		this.#setOpener();
		this.#setSelectedPicker();
	}
}

const select = document.querySelector('.nav-langs-select');
const selector = new Selector(select, {
	// multiple: true,
	// showerElementBtn: {
	// 	className: 'shower-btn',
	// },
	// showerResult: {
	// 	className: 'selected-box',
	// },
	// shownLabel: {
	// 	className: 'shown-label',
	// },
	// shownInput: {
	// 	className: 'shown-iput',
	// },
	// optionsBox: {
	// 	className: 'nav-langs-select__options',
	// },
});

selector.init();

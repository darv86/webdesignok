export class Scrolluper {
	/**
	 * @param {Element} element - html element for scrollup
	 * @param {Object} [options={}] - options for Scrollup instance
	 */
	constructor(element, options = {}) {
		this.element = element;
		this.options = options;
	}

	#getViewportHeight() {
		return document.documentElement.clientHeight;
	}

	#setUpState() {
		addEventListener('scroll', e => {
			if (scrollY >= this.#getViewportHeight()) {
				this.element.setAttribute('up', '');
			} else {
				this.element.removeAttribute('up');
			}
		});
	}

	#setBehaviorOnClick() {
		const behavior = this.options.behavior;

		this.element.addEventListener('click', e => {
			if (scrollY >= this.#getViewportHeight()) {
				scrollTo({ top: 0, behavior });
			} else {
				scrollTo({ top: this.#getViewportHeight(), behavior });
			}
		});
	}

	init() {
		this.#setBehaviorOnClick();
		this.#setUpState();
	}
}

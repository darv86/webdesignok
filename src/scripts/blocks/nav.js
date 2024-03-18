export class Naviator {
	/**
	 * @param {Element} nav
	 * @param {Element} toggler
	 * @param {Object} [settings={}]
	 */
	constructor(nav, toggler, settings = {}) {
		this.nav = nav;
		this.toggler = toggler;
		this.settings = settings;
	}

	#setOpener() {
		this.toggler.addEventListener('click', e => {
			/** @type {Element} */
			// @ts-ignore
			const thisis = e.currentTarget;

			if (thisis.hasAttribute('data-isopen')) {
				this.nav.removeAttribute('data-isopen');
				thisis.removeAttribute('data-isopen');
			} else {
				this.nav.setAttribute('data-isopen', '');
				thisis.setAttribute('data-isopen', '');
			}
		});
		this.toggler.addEventListener('keyup', e => {
			/** @type {Element} */
			// @ts-ignore
			const thisis = e.currentTarget;

			// @ts-ignore
			if (thisis.hasAttribute('data-isopen') && e.code === 'Escape') {
				thisis.removeAttribute('data-isopen');
				this.nav.removeAttribute('data-isopen');
			}
		});
		window.addEventListener('click', e => {
			/** @type {Element} */
			// @ts-ignore
			const nav = e.target;

			if (!nav.closest('.nav')) {
				this.toggler.removeAttribute('data-isopen');
				this.nav.removeAttribute('data-isopen');
			}
		});
	}

	init() {
		this.#setOpener();
	}
}

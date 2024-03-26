/**
 * @param {Element} element - html element for snap slider init
 * @param {Object} slider - instance of SnapSlider
 * @param {Number} [delay=6000] - delay ms, default: 6000
 */
export function autoplaySnapSlider(element, slider, delay = 6000) {
	let autoplayTimer;

	startAutoplay();

	slider.on('change.focusin', stopAutoplay);
	slider.on('change.scroll', stopAutoplay);
	element.addEventListener('click', () => (autoplayTimer ? stopAutoplay() : startAutoplay()));
	element.addEventListener('mouseenter', stopAutoplay);
	element.addEventListener('mouseleave', startAutoplay);

	function startAutoplay() {
		if (autoplayTimer) return;
		autoplayTimer = setInterval(() => slider.goto('next'), delay);
	}

	function stopAutoplay() {
		if (!autoplayTimer) return;
		clearInterval(autoplayTimer);
		autoplayTimer = null;
	}
}

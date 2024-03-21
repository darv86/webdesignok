import SnapSlider from '@tannerhodges/snap-slider';

/** @param {Number} [delay=6000] - delay ms, default: 6000 */
export function autoplaySnapSlider(delay = 6000) {
	const slider = document.querySelector('.testimonials-slider');
	// @ts-ignore
	const snapSlider = new SnapSlider(slider, { start: 'start', loop: true });

	let autoplayTimer;

	startAutoplay();

	snapSlider.on('change.focusin', stopAutoplay);
	snapSlider.on('change.scroll', stopAutoplay);
	slider.addEventListener('click', () => (autoplayTimer ? stopAutoplay() : startAutoplay()));
	slider.addEventListener('mouseenter', stopAutoplay);
	slider.addEventListener('mouseleave', startAutoplay);

	function startAutoplay() {
		if (autoplayTimer) return;
		autoplayTimer = setInterval(() => snapSlider.goto('next'), delay);
	}

	function stopAutoplay() {
		if (!autoplayTimer) return;
		clearInterval(autoplayTimer);
		autoplayTimer = null;
	}
}

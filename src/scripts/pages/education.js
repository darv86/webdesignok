'use strict';

import SnapSlider from '@tannerhodges/snap-slider';

const slider = document.querySelector('.education-books-slider');
// @ts-ignore
const snapSlider = new SnapSlider(slider, {
	start: 'middle',
	align: 'center',
});

import SnapSlider from '@tannerhodges/snap-slider';
import { autoplaySnapSlider } from '../libs/snap-slider.js';

const slider = document.querySelector('.testimonials-slider');
// @ts-ignore
const snapSlider = new SnapSlider(slider, { start: 'start', loop: true });

autoplaySnapSlider(snapSlider);

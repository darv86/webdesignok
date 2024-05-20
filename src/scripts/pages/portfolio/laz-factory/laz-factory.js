'use strict';

import PhotoSwipeLightbox from 'photoswipe/lightbox';
import PhotoSwipe from 'photoswipe';

const lightbox = new PhotoSwipeLightbox({
	gallery: '.photoswipe-gallery',
	children: '.photoswipe-gallery-slide',
	pswpModule: PhotoSwipe,
	padding: { top: 48, bottom: 56, left: 0, right: 0 },
});

// Parse data-pswp-webp-src attribute
lightbox.addFilter('itemData', (itemData, index) => {
	const webpSrc = itemData.element.dataset.pswpWebpSrc;
	if (webpSrc) {
		itemData.webpSrc = webpSrc;
	}
	return itemData;
});

function getCroppedBoundsOffset(position, imageSize, thumbSize, zoomLevel) {
	const float = parseFloat(position);

	return position.indexOf('%') > 0 ? ((thumbSize - imageSize * zoomLevel) * float) / 100 : float;
}

function getCroppedZoomPan(position, min, max) {
	const float = parseFloat(position);

	return position.indexOf('%') > 0 ? min + ((max - min) * float) / 100 : float;
}

function getThumbnail(el) {
	return el.querySelector('img');
}

function getObjectPosition(el) {
	return getComputedStyle(el).getPropertyValue('object-position').split(' ');
}

lightbox.on('initialZoomPan', event => {
	const slide = event.slide;
	const [positionX, positionY] = getObjectPosition(getThumbnail(slide.data.element));

	if (positionX !== '50%' && slide.pan.x < 0) {
		slide.pan.x = getCroppedZoomPan(positionX, slide.bounds.min.x, slide.bounds.max.x);
	}

	if (positionY !== '50%' && slide.pan.y < 0) {
		slide.pan.y = getCroppedZoomPan(positionY, slide.bounds.min.y, slide.bounds.max.y);
	}
});

lightbox.addFilter('thumbBounds', (thumbBounds, itemData) => {
	const thumbEl = getThumbnail(itemData.element);
	const thumbAreaRect = thumbEl.getBoundingClientRect();
	const fillZoomLevel = thumbBounds.w / itemData.width;
	const [positionX, positionY] = getObjectPosition(thumbEl);

	if (positionX !== '50%') {
		const offsetX = getCroppedBoundsOffset(
			positionX,
			itemData.width,
			thumbAreaRect.width,
			fillZoomLevel,
		);
		thumbBounds.x = thumbAreaRect.left + offsetX;
		thumbBounds.innerRect.x = offsetX;
	}

	if (positionY !== '50%') {
		const offsetY = getCroppedBoundsOffset(
			positionY,
			itemData.height,
			thumbAreaRect.height,
			fillZoomLevel,
		);
		thumbBounds.y = thumbAreaRect.top + offsetY;
		thumbBounds.innerRect.y = offsetY;
	}

	return thumbBounds;
});

// use <picture> instead of <img>
lightbox.on('contentLoad', e => {
	const { content, isLazy } = e;

	if (content.data.webpSrc) {
		// prevent to stop the default behavior
		e.preventDefault();

		content.pictureElement = document.createElement('picture');

		const sourceWebp = document.createElement('source');
		sourceWebp.srcset = content.data.webpSrc;
		sourceWebp.type = 'image/webp';

		const sourceJpg = document.createElement('source');
		sourceJpg.srcset = content.data.src;
		sourceJpg.type = 'image/jpeg';

		content.element = document.createElement('img');
		content.element.src = content.data.src;
		content.element.setAttribute('alt', '');
		content.element.className = 'pswp__img';

		content.pictureElement.appendChild(sourceWebp);
		content.pictureElement.appendChild(sourceJpg);
		content.pictureElement.appendChild(content.element);

		content.state = 'loading';

		if (content.element.complete) {
			content.onLoaded();
		} else {
			content.element.onload = () => {
				content.onLoaded();
			};

			content.element.onerror = () => {
				content.onError();
			};
		}
	}
});

// by default PhotoSwipe appends <img>,
// but we want to append <picture>
lightbox.on('contentAppend', e => {
	const { content } = e;
	if (content.pictureElement && !content.pictureElement.parentNode) {
		e.preventDefault();
		content.slide.container.appendChild(content.pictureElement);
	}
});

// for next/prev navigation with <picture>
// by default PhotoSwipe removes <img>,
// but we want to remove <picture>
lightbox.on('contentRemove', e => {
	const { content } = e;
	if (content.pictureElement && content.pictureElement.parentNode) {
		e.preventDefault();
		content.pictureElement.remove();
	}
});

lightbox.init();

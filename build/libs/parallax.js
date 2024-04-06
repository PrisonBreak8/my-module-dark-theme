import { flsModules } from '../files/modules.js';

class Parallax {
	constructor(elements) {
		if (elements.length) {
			this.elements = Array.from(elements).map((el) => (
				new Parallax.Each(el, this.options)
			));
		}
	}
	destroyEvents() {
		this.elements.forEach(el => {
			el.destroyEvents();
		})
	}
	setEvents() {
		this.elements.forEach(el => {
			el.setEvents();
		})
	}

}
Parallax.Each = class {
	constructor(parent) {
		this.parent = parent;
		this.elements = this.parent.querySelectorAll('[data-prlx]');
		this.animation = this.animationFrame.bind(this);
		this.offset = 0;
		this.value = 0;
		this.smooth = parent.dataset.prlxSmooth ? Number(parent.dataset.prlxSmooth) : 15;
		this.setEvents();
	}
	setEvents() {
		this.animationID = window.requestAnimationFrame(this.animation);
	}
	destroyEvents() {
		window.cancelAnimationFrame(this.animationID);
	}
	animationFrame() {
		const topToWindow = this.parent.getBoundingClientRect().top;
		const heightParent = this.parent.offsetHeight;
		const heightWindow = window.innerHeight;
		const positionParent = {
			top: topToWindow - heightWindow,
			bottom: topToWindow + heightParent,
		}
		const centerPoint = this.parent.dataset.prlxCenter ?
			this.parent.dataset.prlxCenter : 'center';

		if (positionParent.top < 30 && positionParent.bottom > -30) {
			// Елемент у початковому положенні (0,0), коли батько знаходиться по відношенню до екрану: 
			switch (centerPoint) {
				// верхній точці (початок батька стикається верхнього краю екрану)
				case 'top':
					this.offset = -1 * topToWindow;
					break;
				// центрі екрана (середина батька у середині екрана)
				case 'center':
					this.offset = (heightWindow / 2) - (topToWindow + (heightParent / 2));
					break;
				// Початок: нижня частина екрана = верхня частина батька
				case 'bottom':
					this.offset = heightWindow - (topToWindow + heightParent);
					break;
			}
		}

		this.value += (this.offset - this.value) / this.smooth;
		this.animationID = window.requestAnimationFrame(this.animation);

		this.elements.forEach(el => {
			const parameters = {
				axis: el.dataset.axis ? el.dataset.axis : 'v',
				direction: el.dataset.direction ? el.dataset.direction + '1' : '-1',
				coefficient: el.dataset.coefficient ? Number(el.dataset.coefficient) : 5,
				additionalProperties: el.dataset.properties ? el.dataset.properties : '',
			}
			this.parameters(el, parameters);
		})
	}
	parameters(el, parameters) {
		if (parameters.axis == 'v') {
			el.style.transform = `translate3D(0, ${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0) ${parameters.additionalProperties}`
		} else if (parameters.axis == 'h') {
			el.style.transform = `translate3D(${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0,0) ${parameters.additionalProperties}`
		}
	}
}
if (document.querySelectorAll('[data-prlx-parent]')) {
	flsModules.parallax = new Parallax(document.querySelectorAll('[data-prlx-parent]'));
}

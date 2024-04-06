//Модуль паралаксу мишею
// (c)Фрілансер по життю, "Хмурый Кот"
// Документація: 

// Підключення функціоналу "Чортоги Фрілансера"
import { isMobile, FLS } from "../files/functions.js";
import { flsModules } from "../files/modules.js";

/*
Предмету, який рухатиметься за мишею, вказати атрибут data-prlx-mouse.

// =========
Якщо потрібно додаткові налаштування - вказати

Атрибут											Значення за замовчуванням
-------------------------------------------------------------------------------------------------------------------
data-prlx-cx="коефіцієнт_х"					100							значення більше - менше відсоток зсуву
data-prlx-cy="коефіцієнт_y"					100							значення більше - менше відсоток зсуву
data-prlx-dxr																		проти осі X
data-prlx-dyr																		проти осі Y
data-prlx-a="швидкість_анімації"				50								більше значення – більше швидкість

// =========
Якщо потрібно зчитувати рух миші в блоці-батьку - тому батькові вказати атрибут data-prlx-mouse-wrapper

Якщо в паралакс картинка - розтягнути її на >100%. 
Наприклад:
	width: 130%;
	height: 130%;
	top: -15%;
	left: -15%;
*/
class MousePRLX {
	constructor(props, data = null) {
		let defaultConfig = {
			init: true,
			logging: true,
		}
		this.config = Object.assign(defaultConfig, props);
		if (this.config.init) {
			const paralaxMouse = document.querySelectorAll('[data-prlx-mouse]');
			if (paralaxMouse.length) {
				this.paralaxMouseInit(paralaxMouse);
				this.setLogging(`Прокинувся, стежу за об'єктами: (${paralaxMouse.length})`);
			} else {
				this.setLogging('Немає жодного обєкта. Сплю...zzZZZzZZz...');
			}
		}
	}
	paralaxMouseInit(paralaxMouse) {
		paralaxMouse.forEach(el => {
			const paralaxMouseWrapper = el.closest('[data-prlx-mouse-wrapper]');

			// Коеф. X 
			const paramСoefficientX = el.dataset.prlxCx ? +el.dataset.prlxCx : 100;
			// Коеф. У 
			const paramСoefficientY = el.dataset.prlxCy ? +el.dataset.prlxCy : 100;
			// Напр. Х
			const directionX = el.hasAttribute('data-prlx-dxr') ? -1 : 1;
			// Напр. У
			const directionY = el.hasAttribute('data-prlx-dyr') ? -1 : 1;
			// Швидкість анімації
			const paramAnimation = el.dataset.prlxA ? +el.dataset.prlxA : 50;


			// Оголошення змінних
			let positionX = 0, positionY = 0;
			let coordXprocent = 0, coordYprocent = 0;

			setMouseParallaxStyle();

			// Перевіряю на наявність батька, в якому зчитуватиметься становище миші
			if (paralaxMouseWrapper) {
				mouseMoveParalax(paralaxMouseWrapper);
			} else {
				mouseMoveParalax();
			}

			function setMouseParallaxStyle() {
				const distX = coordXprocent - positionX;
				const distY = coordYprocent - positionY;
				positionX = positionX + (distX * paramAnimation / 1000);
				positionY = positionY + (distY * paramAnimation / 1000);
				el.style.cssText = `transform: translate3D(${directionX * positionX / (paramСoefficientX / 10)}%,${directionY * positionY / (paramСoefficientY / 10)}%,0);`;
				requestAnimationFrame(setMouseParallaxStyle);
			}
			function mouseMoveParalax(wrapper = window) {
				wrapper.addEventListener("mousemove", function (e) {
					const offsetTop = el.getBoundingClientRect().top + window.scrollY;
					if (offsetTop >= window.scrollY || (offsetTop + el.offsetHeight) >= window.scrollY) {
						// Отримання ширини та висоти блоку
						const parallaxWidth = window.innerWidth;
						const parallaxHeight = window.innerHeight;
						// Нуль посередині
						const coordX = e.clientX - parallaxWidth / 2;
						const coordY = e.clientY - parallaxHeight / 2;
						// Отримуємо відсотки
						coordXprocent = coordX / parallaxWidth * 100;
						coordYprocent = coordY / parallaxHeight * 100;
					}
				});
			}
		});
	}
	// Логінг у консоль
	setLogging(message) {
		this.config.logging ? FLS(`[PRLX Mouse]: ${message}`) : null;
	}
}
// Запускаємо та додаємо в об'єкт модулів
flsModules.mousePrlx = new MousePRLX({});




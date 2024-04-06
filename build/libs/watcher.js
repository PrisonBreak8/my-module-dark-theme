// Підключення функціоналу "Чортоги Фрілансера"
import { isMobile, uniqArray, FLS } from "../files/functions.js";
import { flsModules } from "../files/modules.js";

// Спостерігач об'єктів [всевидюче око]
// data-watch - можна писати значення для застосування кастомного коду
// data-watch-root - батьківський елемент всередині якого спостерігати за об'єктом
// data-watch-margin -відступ
// data-watch-threshold - відсоток показу об'єкта для спрацьовування
// data-watch-once - спостерігати лише один раз
// _watcher-view - клас який додається за появи об'єкта

class ScrollWatcher {
	constructor(props) {
		let defaultConfig = {
			logging: true,
		}
		this.config = Object.assign(defaultConfig, props);
		this.observer;
		!document.documentElement.classList.contains('watcher') ? this.scrollWatcherRun() : null;
	}
	// Оновлюємо конструктор
	scrollWatcherUpdate() {
		this.scrollWatcherRun();
	}
	// Запускаємо конструктор
	scrollWatcherRun() {
		document.documentElement.classList.add('watcher');
		this.scrollWatcherConstructor(document.querySelectorAll('[data-watch]'));
	}
	// Конструктор спостерігачів
	scrollWatcherConstructor(items) {
		if (items.length) {
			this.scrollWatcherLogging(`Прокинувся, стежу за об'єктами (${items.length})...`);
			// Унікалізуємо параметри
			let uniqParams = uniqArray(Array.from(items).map(function (item) {
				return `${item.dataset.watchRoot ? item.dataset.watchRoot : null}|${item.dataset.watchMargin ? item.dataset.watchMargin : '0px'}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`;
			}));
			// Отримуємо групи об'єктів з однаковими параметрами,
			// створюємо налаштування, ініціалізуємо спостерігач
			uniqParams.forEach(uniqParam => {
				let uniqParamArray = uniqParam.split('|');
				let paramsWatch = {
					root: uniqParamArray[0],
					margin: uniqParamArray[1],
					threshold: uniqParamArray[2]
				}
				let groupItems = Array.from(items).filter(function (item) {
					let watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null;
					let watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : '0px';
					let watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : 0;
					if (
						String(watchRoot) === paramsWatch.root &&
						String(watchMargin) === paramsWatch.margin &&
						String(watchThreshold) === paramsWatch.threshold
					) {
						return item;
					}
				});

				let configWatcher = this.getScrollWatcherConfig(paramsWatch);

				// Ініціалізація спостерігача зі своїми налаштуваннями
				this.scrollWatcherInit(groupItems, configWatcher);
			});
		} else {
			this.scrollWatcherLogging("Сплю, немає об'єктів для стеження. ZzzZZzz");
		}
	}
	// Функція створення налаштувань
	getScrollWatcherConfig(paramsWatch) {
		//Створюємо налаштування
		let configWatcher = {}
		// Батько, у якому ведеться спостереження
		if (document.querySelector(paramsWatch.root)) {
			configWatcher.root = document.querySelector(paramsWatch.root);
		} else if (paramsWatch.root !== 'null') {
			this.scrollWatcherLogging(`Эмм... батьківського об'єкта ${paramsWatch.root} немає на сторінці`);
		}
		// Відступ спрацьовування
		configWatcher.rootMargin = paramsWatch.margin;
		if (paramsWatch.margin.indexOf('px') < 0 && paramsWatch.margin.indexOf('%') < 0) {
			this.scrollWatcherLogging(`йой, налаштування data-watch-margin потрібно задавати в PX або %`);
			return
		}
		// Точки спрацьовування
		if (paramsWatch.threshold === 'prx') {
			// Режим паралаксу
			paramsWatch.threshold = [];
			for (let i = 0; i <= 1.0; i += 0.005) {
				paramsWatch.threshold.push(i);
			}
		} else {
			paramsWatch.threshold = paramsWatch.threshold.split(',');
		}
		configWatcher.threshold = paramsWatch.threshold;

		return configWatcher;
	}
	// Функція створення нового спостерігача зі своїми налаштуваннями
	scrollWatcherCreate(configWatcher) {
		this.observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				this.scrollWatcherCallback(entry, observer);
			});
		}, configWatcher);
	}
	// Функція ініціалізації спостерігача зі своїми налаштуваннями
	scrollWatcherInit(items, configWatcher) {
		// Створення нового спостерігача зі своїми налаштуваннями
		this.scrollWatcherCreate(configWatcher);
		// Передача спостерігачеві елементів
		items.forEach(item => this.observer.observe(item));
	}
	// Функція обробки базових дій точок спрацьовування
	scrollWatcherIntersecting(entry, targetElement) {
		if (entry.isIntersecting) {
			// Бачимо об'єкт
			// Додаємо клас
			!targetElement.classList.contains('_watcher-view') ? targetElement.classList.add('_watcher-view') : null;
			this.scrollWatcherLogging(`Я бачу ${targetElement.classList}, додав клас _watcher-view`);
		} else {
			// Не бачимо об'єкт
			// Забираємо клас
			targetElement.classList.contains('_watcher-view') ? targetElement.classList.remove('_watcher-view') : null;
			this.scrollWatcherLogging(`Я не бачу ${targetElement.classList}, прибрав клас _watcher-view`);
		}
	}
	// Функція відключення стеження за об'єктом
	scrollWatcherOff(targetElement, observer) {
		observer.unobserve(targetElement);
		this.scrollWatcherLogging(`Я перестав стежити за ${targetElement.classList}`);
	}
	// Функція виведення в консоль
	scrollWatcherLogging(message) {
		this.config.logging ? FLS(`[Спостерігач]: ${message}`) : null;
	}
	// Функція обробки спостереження
	scrollWatcherCallback(entry, observer) {
		const targetElement = entry.target;
		// Обробка базових дій точок спрацьовування
		this.scrollWatcherIntersecting(entry, targetElement);
		// Якщо є атрибут data-watch-once прибираємо стеження
		targetElement.hasAttribute('data-watch-once') && entry.isIntersecting ? this.scrollWatcherOff(targetElement, observer) : null;
		// Створюємо свою подію зворотного зв'язку
		document.dispatchEvent(new CustomEvent("watcherCallback", {
			detail: {
				entry: entry
			}
		}));

		/*
		// Вибираємо потрібні об'єкти
		if (targetElement.dataset.watch === 'some value') {
			// пишемо унікальну специфіку
		}
		if (entry.isIntersecting) {
			//Бачимо об'єкт
		} else {
			//Не бачимо об'єкт
		}
		*/
	}
}
// Запускаємо та додаємо в об'єкт модулів
flsModules.watcher = new ScrollWatcher({});

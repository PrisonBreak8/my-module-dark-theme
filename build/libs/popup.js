// Модуль попапів
// (c) Фрілансер по життю, "Хмурый Кот"
// Документація по роботі у шаблоні: https://template.fls.guru/template-docs/funkcional-popup.html
// Сніппет (HTML): pl

// Підключення функціоналу "Чортоги Фрілансера"
import { isMobile, bodyLockStatus, bodyLock, bodyUnlock, bodyLockToggle, FLS } from "../files/functions.js";
import { flsModules } from "../files/modules.js";

// Клас Popup
class Popup {
	constructor(options) {
		let config = {
			logging: true,
			init: true,
			//Для кнопок
			attributeOpenButton: 'data-popup', // Атрибут для кнопки, яка викликає попап
			attributeCloseButton: 'data-close', // Атрибут для кнопки, що закриває попап
			// Для сторонніх об'єктів
			fixElementSelector: '[data-lp]', // Атрибут для елементів із лівим паддингом (які fixed)
			// Для об'єкту попапа
			youtubeAttribute: 'data-popup-youtube', // Атрибут для коду youtube
			youtubePlaceAttribute: 'data-popup-youtube-place', // Атрибут для вставки ролика youtube
			setAutoplayYoutube: true,
			// Зміна класів
			classes: {
				popup: 'popup',
				// popupWrapper: 'popup__wrapper',
				popupContent: 'popup__content',
				popupActive: 'popup_show', // Додається для попапа, коли він відкривається
				bodyActive: 'popup-show', // Додається для боді, коли попап відкритий
			},
			focusCatch: true, // Фокус усередині попапа зациклений
			closeEsc: true, // Закриття ESC
			bodyLock: true, // Блокування скролла
			hashSettings: {
				location: true, // Хеш в адресному рядку
				goHash: true, // Перехід по наявності в адресному рядку
			},
			on: { // Події
				beforeOpen: function () { },
				afterOpen: function () { },
				beforeClose: function () { },
				afterClose: function () { },
			},
		}
		this.youTubeCode;
		this.isOpen = false;
		// Поточне вікно
		this.targetOpen = {
			selector: false,
			element: false,
		}
		// Попереднє відкрите
		this.previousOpen = {
			selector: false,
			element: false,
		}
		// Останнє закрите
		this.lastClosed = {
			selector: false,
			element: false,
		}
		this._dataValue = false;
		this.hash = false;

		this._reopen = false;
		this._selectorOpen = false;

		this.lastFocusEl = false;
		this._focusEl = [
			'a[href]',
			'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
			'button:not([disabled]):not([aria-hidden])',
			'select:not([disabled]):not([aria-hidden])',
			'textarea:not([disabled]):not([aria-hidden])',
			'area[href]',
			'iframe',
			'object',
			'embed',
			'[contenteditable]',
			'[tabindex]:not([tabindex^="-"])'
		];
		//this.options = Object.assign(config, options);
		this.options = {
			...config,
			...options,
			classes: {
				...config.classes,
				...options?.classes,
			},
			hashSettings: {
				...config.hashSettings,
				...options?.hashSettings,
			},
			on: {
				...config.on,
				...options?.on,
			}
		}
		this.bodyLock = false;
		this.options.init ? this.initPopups() : null
	}
	initPopups() {
		this.popupLogging(`Прокинувся`);
		this.eventsPopup();
	}
	eventsPopup() {
		// Клік по всьому документі
		document.addEventListener("click", function (e) {
			// Клік по кнопці "відкрити"
			const buttonOpen = e.target.closest(`[${this.options.attributeOpenButton}]`);
			if (buttonOpen) {
				e.preventDefault();
				this._dataValue = buttonOpen.getAttribute(this.options.attributeOpenButton) ?
					buttonOpen.getAttribute(this.options.attributeOpenButton) :
					'error';
				this.youTubeCode = buttonOpen.getAttribute(this.options.youtubeAttribute) ?
					buttonOpen.getAttribute(this.options.youtubeAttribute) :
					null;
				if (this._dataValue !== 'error') {
					if (!this.isOpen) this.lastFocusEl = buttonOpen;
					this.targetOpen.selector = `${this._dataValue}`;
					this._selectorOpen = true;
					this.open();
					return;

				} else this.popupLogging(`Йой, не заповнено атрибут у ${buttonOpen.classList}`);

				return;
			}
			// Закриття на порожньому місці (popup__wrapper) та кнопки закриття (popup__close) для закриття
			const buttonClose = e.target.closest(`[${this.options.attributeCloseButton}]`);
			if (buttonClose || !e.target.closest(`.${this.options.classes.popupContent}`) && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
		}.bind(this));
		// Закриття ESC
		document.addEventListener("keydown", function (e) {
			if (this.options.closeEsc && e.which == 27 && e.code === 'Escape' && this.isOpen) {
				e.preventDefault();
				this.close();
				return;
			}
			if (this.options.focusCatch && e.which == 9 && this.isOpen) {
				this._focusCatch(e);
				return;
			}
		}.bind(this))

		// Відкриття по хешу
		if (this.options.hashSettings.goHash) {
			// Перевірка зміни адресного рядка
			window.addEventListener('hashchange', function () {
				if (window.location.hash) {
					this._openToHash();
				} else {
					this.close(this.targetOpen.selector);
				}
			}.bind(this))

			window.addEventListener('load', function () {
				if (window.location.hash) {
					this._openToHash();
				}
			}.bind(this))
		}
	}
	open(selectorValue) {
		if (bodyLockStatus) {
			// Якщо перед відкриттям попапа був режим lock
			this.bodyLock = document.documentElement.classList.contains('lock') && !this.isOpen ? true : false;

			// Якщо ввести значення селектора (селектор настроюється в options)
			if (selectorValue && typeof (selectorValue) === "string" && selectorValue.trim() !== "") {
				this.targetOpen.selector = selectorValue;
				this._selectorOpen = true;
			}
			if (this.isOpen) {
				this._reopen = true;
				this.close();
			}
			if (!this._selectorOpen) this.targetOpen.selector = this.lastClosed.selector;
			if (!this._reopen) this.previousActiveElement = document.activeElement;

			this.targetOpen.element = document.querySelector(this.targetOpen.selector);

			if (this.targetOpen.element) {
				// YouTube
				if (this.youTubeCode) {
					const codeVideo = this.youTubeCode;
					const urlVideo = `https://www.youtube.com/embed/${codeVideo}?rel=0&showinfo=0&autoplay=1`
					const iframe = document.createElement('iframe');
					iframe.setAttribute('allowfullscreen', '');

					const autoplay = this.options.setAutoplayYoutube ? 'autoplay;' : '';
					iframe.setAttribute('allow', `${autoplay}; encrypted-media`);

					iframe.setAttribute('src', urlVideo);

					if (!this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`)) {
						const youtubePlace = this.targetOpen.element.querySelector('.popup__text').setAttribute(`${this.options.youtubePlaceAttribute}`, '');
					}
					this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).appendChild(iframe);
				}
				if (this.options.hashSettings.location) {
					// Отримання хешу та його виставлення
					this._getHash();
					this._setHash();
				}

				// До відкриття
				this.options.on.beforeOpen(this);
				// Створюємо свою подію після відкриття попапа
				document.dispatchEvent(new CustomEvent("beforePopupOpen", {
					detail: {
						popup: this
					}
				}));

				this.targetOpen.element.classList.add(this.options.classes.popupActive);
				document.documentElement.classList.add(this.options.classes.bodyActive);

				if (!this._reopen) {
					!this.bodyLock ? bodyLock() : null;
				}
				else this._reopen = false;

				this.targetOpen.element.setAttribute('aria-hidden', 'false');

				// Запам'ятаю це відчинене вікно. Воно буде останнім відкритим
				this.previousOpen.selector = this.targetOpen.selector;
				this.previousOpen.element = this.targetOpen.element;

				this._selectorOpen = false;

				this.isOpen = true;

				setTimeout(() => {
					this._focusTrap();
				}, 50);

				// Після відкриття
				this.options.on.afterOpen(this);
				// Створюємо свою подію після відкриття попапа
				document.dispatchEvent(new CustomEvent("afterPopupOpen", {
					detail: {
						popup: this
					}
				}));
				this.popupLogging(`Відкрив попап`);

			} else this.popupLogging(`Йой, такого попапу немає. Перевірте коректність введення. `);
		}
	}
	close(selectorValue) {
		if (selectorValue && typeof (selectorValue) === "string" && selectorValue.trim() !== "") {
			this.previousOpen.selector = selectorValue;
		}
		if (!this.isOpen || !bodyLockStatus) {
			return;
		}
		// До закриття
		this.options.on.beforeClose(this);
		// Створюємо свою подію перед закриттям попапа
		document.dispatchEvent(new CustomEvent("beforePopupClose", {
			detail: {
				popup: this
			}
		}));

		// YouTube
		if (this.youTubeCode) {
			if (this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`))
				this.targetOpen.element.querySelector(`[${this.options.youtubePlaceAttribute}]`).innerHTML = '';
		}
		this.previousOpen.element.classList.remove(this.options.classes.popupActive);
		// aria-hidden
		this.previousOpen.element.setAttribute('aria-hidden', 'true');
		if (!this._reopen) {
			document.documentElement.classList.remove(this.options.classes.bodyActive);
			!this.bodyLock ? bodyUnlock() : null;
			this.isOpen = false;
		}
		// Очищення адресного рядка
		this._removeHash();
		if (this._selectorOpen) {
			this.lastClosed.selector = this.previousOpen.selector;
			this.lastClosed.element = this.previousOpen.element;

		}
		// Після закриття
		this.options.on.afterClose(this);
		// Створюємо свою подію після закриття попапа
		document.dispatchEvent(new CustomEvent("afterPopupClose", {
			detail: {
				popup: this
			}
		}));

		setTimeout(() => {
			this._focusTrap();
		}, 50);

		this.popupLogging(`Закрив попап`);
	}
	// Отримання хешу 
	_getHash() {
		if (this.options.hashSettings.location) {
			this.hash = this.targetOpen.selector.includes('#') ?
				this.targetOpen.selector : this.targetOpen.selector.replace('.', '#')
		}
	}
	_openToHash() {
		let classInHash = document.querySelector(`.${window.location.hash.replace('#', '')}`) ? `.${window.location.hash.replace('#', '')}` :
			document.querySelector(`${window.location.hash}`) ? `${window.location.hash}` :
				null;

		const buttons = document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) ? document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash}"]`) : document.querySelector(`[${this.options.attributeOpenButton} = "${classInHash.replace('.', "#")}"]`);

		this.youTubeCode = buttons.getAttribute(this.options.youtubeAttribute) ?
			buttons.getAttribute(this.options.youtubeAttribute) :
			null;

		if (buttons && classInHash) this.open(classInHash);
	}
	// Встановлення хеша
	_setHash() {
		history.pushState('', '', this.hash);
	}
	_removeHash() {
		history.pushState('', '', window.location.href.split('#')[0])
	}
	_focusCatch(e) {
		const focusable = this.targetOpen.element.querySelectorAll(this._focusEl);
		const focusArray = Array.prototype.slice.call(focusable);
		const focusedIndex = focusArray.indexOf(document.activeElement);

		if (e.shiftKey && focusedIndex === 0) {
			focusArray[focusArray.length - 1].focus();
			e.preventDefault();
		}
		if (!e.shiftKey && focusedIndex === focusArray.length - 1) {
			focusArray[0].focus();
			e.preventDefault();
		}
	}
	_focusTrap() {
		const focusable = this.previousOpen.element.querySelectorAll(this._focusEl);
		if (!this.isOpen && this.lastFocusEl) {
			this.lastFocusEl.focus();
		} else {
			focusable[0].focus();
		}
	}
	// Функція виведення в консоль
	popupLogging(message) {
		this.options.logging ? FLS(`[Попапос]: ${message}`) : null;
	}
}
// Запускаємо та додаємо в об'єкт модулів
flsModules.popup = new Popup({});
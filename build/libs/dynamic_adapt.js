// Dynamic Adapt v.1
// HTML data-da="where(uniq class name),when(breakpoint),position(digi)"
// e.x. data-da=".item,992,2"
// Andrikanych Yevhen 2020
// https://www.youtube.com/c/freelancerlifestyle

class DynamicAdapt {
	constructor(type) {
		this.type = type
	}
	init() {
		// масив об'єктів
		this.оbjects = []
		this.daClassname = '_dynamic_adapt_'
		// масив DOM-елементів
		this.nodes = [...document.querySelectorAll('[data-da]')]

		// наповнення оbjects об'єктами
		this.nodes.forEach((node) => {
			const data = node.dataset.da.trim()
			const dataArray = data.split(',')
			const оbject = {}
			оbject.element = node
			оbject.parent = node.parentNode
			оbject.destination = document.querySelector(`${dataArray[0].trim()}`)
			оbject.breakpoint = dataArray[1] ? dataArray[1].trim() : '767'
			оbject.place = dataArray[2] ? dataArray[2].trim() : 'last'
			оbject.index = this.indexInParent(оbject.parent, оbject.element)
			this.оbjects.push(оbject)
		})

		this.arraySort(this.оbjects)

		// масив унікальних медіа-запитів
		this.mediaQueries = this.оbjects
			.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint}px),${breakpoint}`)
			.filter((item, index, self) => self.indexOf(item) === index)

		// навішування слухача на медіа-запит
		// та виклик оброблювача при першому запуску
		this.mediaQueries.forEach((media) => {
			const mediaSplit = media.split(',')
			const matchMedia = window.matchMedia(mediaSplit[0])
			const mediaBreakpoint = mediaSplit[1]

			// масив об'єктів з відповідним брейкпоінтом
			const оbjectsFilter = this.оbjects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint)
			matchMedia.addEventListener('change', () => {
				this.mediaHandler(matchMedia, оbjectsFilter)
			})
			this.mediaHandler(matchMedia, оbjectsFilter)
		})
	}
	// Основна функція
	mediaHandler(matchMedia, оbjects) {
		if (matchMedia.matches) {
			оbjects.forEach((оbject) => {
				// оbject.index = this.indexInParent(оbject.parent, оbject.element);
				this.moveTo(оbject.place, оbject.element, оbject.destination)
			})
		} else {
			оbjects.forEach(({ parent, element, index }) => {
				if (element.classList.contains(this.daClassname)) {
					this.moveBack(parent, element, index)
				}
			})
		}
	}
	// Функція переміщення
	moveTo(place, element, destination) {
		element.classList.add(this.daClassname)
		if (place === 'last' || place >= destination.children.length) {
			destination.append(element)
			return
		}
		if (place === 'first') {
			destination.prepend(element)
			return
		}
		destination.children[place].before(element)
	}
	// Функція повернення
	moveBack(parent, element, index) {
		element.classList.remove(this.daClassname)
		if (parent.children[index] !== undefined) {
			parent.children[index].before(element)
		} else {
			parent.append(element)
		}
	}
	// Функція отримання індексу всередині батьківського єлементу
	indexInParent(parent, element) {
		return [...parent.children].indexOf(element)
	}
	// Функція сортування масиву по breakpoint та place
	// за зростанням для this.type = min
	// за спаданням для this.type = max
	arraySort(arr) {
		if (this.type === 'min') {
			arr.sort((a, b) => {
				if (a.breakpoint === b.breakpoint) {
					if (a.place === b.place) {
						return 0
					}
					if (a.place === 'first' || b.place === 'last') {
						return -1
					}
					if (a.place === 'last' || b.place === 'first') {
						return 1
					}
					return 0
				}
				return a.breakpoint - b.breakpoint
			})
		} else {
			arr.sort((a, b) => {
				if (a.breakpoint === b.breakpoint) {
					if (a.place === b.place) {
						return 0
					}
					if (a.place === 'first' || b.place === 'last') {
						return 1
					}
					if (a.place === 'last' || b.place === 'first') {
						return -1
					}
					return 0
				}
				return b.breakpoint - a.breakpoint
			})
			return
		}
	}
}
const da = new DynamicAdapt("max");
da.init();
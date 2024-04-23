export function filterGallery() {
	let filterList = document.querySelectorAll('.filter__button');
	let productBox = document.querySelectorAll('.card');
	if (filterList.length) {
		for (let i = 0; i < filterList.length; i++) {
			filterList[i].addEventListener('click', function () {
				for (let j = 0; j < filterList.length; j++) {
					filterList[j].classList.remove('active');
				}
				this.classList.add('active');
				let dataFilter = this.getAttribute('data-filter');
				for (let k = 0; k < productBox.length; k++) {
					productBox[k].classList.remove('active');
					productBox[k].classList.add('hiden');
					if (
						productBox[k].getAttribute('data-item') === dataFilter ||
						dataFilter === 'all'
					) {
						productBox[k].classList.remove('hiden');
						productBox[k].classList.add('active');
					}
				}
			});
		}
	}
}

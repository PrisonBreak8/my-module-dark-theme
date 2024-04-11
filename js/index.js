// Module Dark and Light Theme
export function modeInit() {
	//============ DARK LIGHT THEME ============================================================================================================================================
	// Switch function
	const switchTheme = () => {
		// Get root element and data-theme value
		const rootElem = document.documentElement;
		let dataTheme = rootElem.getAttribute('data-theme');
		let newTheme = rootElem.getAttribute('data-theme');
		newTheme = (dataTheme === 'light') ? 'dark' : 'light';
		// Set the new HTML attribute
		rootElem.setAttribute('data-theme', newTheme);
		// Set the new local storage item 
		localStorage.setItem('theme', newTheme);
	}
	//Add event listener for the theme switcher
	document.querySelector('#theme-switcher').addEventListener('click', switchTheme);
}
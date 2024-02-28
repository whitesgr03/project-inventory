const container = document.querySelector(".container");

const handleClick = e => {
	!e.target.closest(".hamburger") &&
		!e.target.closest("nav") &&
		handleCloseHamburger();
	e.target.closest(".hamburger") && handleActiveHamburger();
	e.target.closest(".theme") && handleChangeTheme();
};

const handleCloseHamburger = () => {
	const hamburgerBtn = document.querySelector(".hamburger button > div");
	const sidebar = document.querySelector("nav");
	hamburgerBtn.classList.remove("active");
	sidebar.classList.remove("show");
};

const handleActiveHamburger = () => {
	const hamburgerBtn = document.querySelector(".hamburger button > div");
	const sidebar = document.querySelector("nav");
	hamburgerBtn.classList.toggle("active");
	sidebar.classList.toggle("show");
};

const handleChangeTheme = () =>
	container.classList.contains("dark")
		? container.classList.replace("dark", "light")
		: container.classList.replace("light", "dark");

const checkPrefersColorScheme = () => {
	const colorScheme =
		window.matchMedia("(prefers-color-scheme: dark)")?.matches ?? false;
	container.classList.add(colorScheme ? "dark" : "light");
};

checkPrefersColorScheme();

container.addEventListener("click", handleClick);

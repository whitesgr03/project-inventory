const handleClick = e => {
	const hamburgerBtn = document.querySelector(".hamburger button > div");
	const sidebar = document.querySelector("nav");

	const handleCloseHamburger = () => {
		hamburgerBtn.classList.remove("active");
		sidebar.classList.remove("show");
	};

	const handleActiveHamburger = () => {
		hamburgerBtn.classList.toggle("active");
		sidebar.classList.toggle("show");
	};

	const handleChangeTheme = () =>
		localStorage.setItem(
			"darkScheme",
			JSON.stringify(document.body.classList.toggle("dark"))
		);

	!e.target.closest(".hamburger") &&
		!e.target.closest("nav") &&
		handleCloseHamburger();
	e.target.closest(".hamburger") && handleActiveHamburger();
	e.target.closest(".theme") && handleChangeTheme();
};

document.body.addEventListener("click", handleClick);

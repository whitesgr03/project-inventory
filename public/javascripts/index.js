const inputFile = document.querySelector('input[name="image"]');

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
const handleChange = e => {
	const imageElement = document.querySelector(".image");
	imageElement.classList.remove("preview");

	const uploadImage = e.target?.files[0];

	const handlePreview = () => {
		imageElement.firstElementChild.src = URL.createObjectURL(uploadImage);
		imageElement.classList.add("preview");
	};

	uploadImage && uploadImage.type === "image/jpeg" && handlePreview();
};

document.body.addEventListener("click", handleClick);

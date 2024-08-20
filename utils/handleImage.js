const encodeFile = name => name.replace(/[^a-z0-9]+/gi, "-");

const getImageUrl = ({ product, size }) => {
	const fileName = encodeFile(product.name);
	const modified = `v=${+product.lastModified}`;
	const transform = size
		? `${product?.expiresAfter ? "&" : "?"}tr=w-${size},h-${size}`
		: "";

	return product?.expiresAfter
		? `project-inventory-user/${fileName}?${modified}${transform}`
		: `project-inventory-bucket/${fileName}.jpg${transform}`;
};

export { encodeFile, getImageUrl };

import mongoose from "mongoose";
import unescape from "validator/lib/unescape.js";

const Schema = mongoose.Schema;

const getImageName = (name, lastModified) => {
	return lastModified
		? `${unescape(name).replace(/[^a-z0-9]+/gi, "-")}-${+lastModified}.jpg`
		: `${unescape(name).replace(/[^a-z0-9]+/gi, "-")}.jpg`;
};

const getImageUrl = (size, userCreated) =>
	`https://ik.imagekit.io/whitesgr03/project-inventory-${
		userCreated ? "user" : "bucket"
	}/tr:w-${size},h-${size}/`;

const ProductSchema = new Schema(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		category: {
			type: Schema.Types.ObjectId,
			ref: "Category",
			required: true,
		},
		price: { type: Number, required: true },
		quantity: { type: Number, required: true },
		lastModified: { type: Date, required: true },
		expiresAfter: {
			type: Date,
			immutable: true,
		},
	},
	{
		virtuals: {
			url: {
				get() {
					return `/inventory/product/${this._id}`;
				},
			},
			imageUrl: {
				get() {
					return `https://storage.googleapis.com/project-inventory-${
						this.expiresAfter ? "user" : "bucket"
					}/${getImageName(
						this.name,
						this.expiresAfter ? this.lastModified : null
					)}`;
				},
			},
			imageUrl_300: {
				get() {
					return (
						getImageUrl("300", this.expiresAfter) +
						getImageName(
							this.name,
							this.expiresAfter ? this.lastModified : null
						)
					);
				},
			},
			imageUrl_400: {
				get() {
					return (
						getImageUrl("400", this.expiresAfter) +
						getImageName(
							this.name,
							this.expiresAfter ? this.lastModified : null
						)
					);
				},
			},
			imageUrl_600: {
				get() {
					return (
						getImageUrl("600", this.expiresAfter) +
						getImageName(
							this.name,
							this.expiresAfter ? this.lastModified : null
						)
					);
				},
			},
		},
	}
);

ProductSchema.index({ expiresAfter: 1 }, { expireAfterSeconds: 1 });

const ProductModel = mongoose.model("Product", ProductSchema);

export default ProductModel;

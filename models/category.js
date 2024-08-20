import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CategorySchema = new Schema(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		expiresAfter: { type: Date, immutable: true },
	},
	{
		virtuals: {
			url: {
				get() {
					return `/inventory/categories/${this._id}`;
				},
			},
		},
	}
);

CategorySchema.index({ expiresAfter: 1 }, { expireAfterSeconds: 1 });

const CategoryModel = mongoose.model("Category", CategorySchema);

export default CategoryModel;

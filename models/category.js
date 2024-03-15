const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		expiresAfter: {
			type: Date,
			immutable: true,
		},
	},
	{
		virtuals: {
			url: {
				get() {
					return `/inventory/category/${this._id}`;
				},
			},
		},
	}
);

const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;

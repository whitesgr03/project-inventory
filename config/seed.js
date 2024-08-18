import Category from "../models/category.js";
import Product from "../models/product.js";
import debug from "debug";

const databaseLog = debug("Mongoose");

const seedingCategories = async () => {
	const docExists = await Category.findOne().exec();

	const handleSeeding = async () => {
		const categories = [
			{
				name: "Dry Dog Food",
				description:
					"Discover our great selection of the best dry dog food at fantastic prices shipped across Ireland. Find dog food that matches the nutritional needs of your dog, based on age, breed, or special health and dietary needs. ",
			},
			{
				name: "Wet Dog Food",
				description:
					"Wet dog food makes a great supplement to dry dog food. Canned dog foods and pouches can also be a tasty meal on their own. Here you'll find a great selection of wet dog foods available in cans or pouches in a variety of sizes.",
			},
			{
				name: "Dog Treats",
				description:
					"Dog treats and dog snacks are sensible supplements to your pet's regular diet. Treats for dogs can provide your pooch with extra vitamins and nutrients that regular dog food may not provide and many are good for dental health too plus stop your dog finding other things to chew.",
			},
			{
				name: "Dog Toys",
				description:
					"Dog toys can help you build a trusting relationship with your dog and provide all-important exercise and activity. Dog sports, including dog agility courses, are also gaining popularity and various dog training equipment can help you & your pet be successful in your goals and bring variety and enjoyment to your dog's agility sessions. Chew toys can also be great in keeping your dog's teeth and gums healthy. Jaw muscles can be strengthened through extensive chewing. It also helps to keep teeth clean, combatting plaque and tartar build up through dental abrasion. ",
			},
		];
		await Category.insertMany(categories);
	};

	!docExists && (await handleSeeding());
};
const seedingProducts = async () => {
	const docExists = await Product.findOne().exec();

	const handleSeeding = async () => {
		const currentTime = new Date();
		const categories = await Category.find({}, { _id: 1 }).exec();
		const products = [
			{
				name: 'Wolf of Wilderness Adult "Sunny Glade" - Venison',
				description:
					"This premium adult dry dog food is grain-free and based on the wolf's natural diet. It is made with 41% fresh chicken & top quality venison, enriched with berries, wild herbs and roots.",
				category: categories[0]._id,
				price: 7.49,
				quantity: 50,
				lastModified: currentTime,
			},
			{
				name: 'Wolf of Wilderness Adult "Wild Hills" - Duck',
				description:
					"Made with 41% fresh chicken and duck, and enriched with berries, wild herbs and roots, this premium quality, grain-free dry food is based on the wolf's natural diet in the wild.",
				category: categories[0]._id,
				price: 7.99,
				quantity: 50,
				lastModified: currentTime,
			},
			{
				name: 'Wolf of Wilderness Adult "Blue River" - Salmon',
				description:
					"Delicious kibble for adult dogs, made with 41% fresh chicken and salmon, enriched with berries, wild herbs and roots, this quality dry dog food is grain-free and reflects the wolf's natural diet.",
				category: categories[0]._id,
				price: 7.99,
				quantity: 50,
				lastModified: currentTime,
			},
			{
				name: 'Wolf of Wilderness Adult "Oak Woods" – Wild Boar',
				description:
					"Species appropriate, grain-free dry dog food that mimics the wolf’s natural wild diet, made with 41% fresh chicken and wild boar refined with berries, wild herbs and roots.",
				category: categories[0]._id,
				price: 7.99,
				quantity: 50,
				lastModified: currentTime,
			},
			{
				name: 'Wolf of Wilderness Adult "Green Fields" - Lamb',
				description:
					"Grain-free, species-appropriate adult dry dog food based on the wild wolf's natural diet, this wholesome kibble is made with lamb and 41% fresh chicken, enriched with berries, herbs & roots.",
				category: categories[0]._id,
				price: 7.49,
				quantity: 50,
				lastModified: currentTime,
			},
			{
				name: "Lukullus Rabbit & Game x6",
				description:
					"Lukullus natural dog food is a healthy complete diet and provides your pet with all essential nutrients, in the flavour Rabbit & Game with Brown Rice, Apple & Linseed Oil. Now in a fresh new design!",
				category: categories[1]._id,
				price: 19.99,
				quantity: 30,
				lastModified: currentTime,
			},
			{
				name: "Lukullus Wild Rabbit & Turkey x6",
				description:
					"Lukullus is a delicious food for dogs, full of essential nutrients and natural, healthy ingredients. In tasty variety Wild Rabbit & Turkey with Pear, Oat Flakes & Safflower Oil. Now in a new design!",
				category: categories[1]._id,
				price: 20.99,
				quantity: 30,
				lastModified: currentTime,
			},
			{
				name: "Lukullus Turkey Hearts & Goose x6",
				description:
					"Lukullus wet dog food is a natural, healthy diet & provides your pet with important nutrients. In the delicious flavour Turkey Hearts & Goose with Barley, Leek & Safflower Oil. Now in a new design!",
				category: categories[1]._id,
				price: 20.99,
				quantity: 30,
				lastModified: currentTime,
			},
			{
				name: "Lukullus Poultry & Lamb - Grain-Free x6",
				description:
					"A tasty, all-natural grain-free wet dog food, made with carefully selected ingredients. Poultry and lamb are combined with potatoes, dandelion and linseed oil to create a nutritious, complete meal.",
				category: categories[1]._id,
				price: 17.99,
				quantity: 30,
				lastModified: currentTime,
			},
			{
				name: "Lukullus Beef & Turkey - Grain-Free x6",
				description:
					"Grain-free. with wholesome beef & turkey, this complete wet dog food provides all the nutrients and vitamins your pet needs. Made with healthy ingredients, herbs and oils, it is totally additive-free.",
				category: categories[1]._id,
				price: 17.99,
				quantity: 30,
				lastModified: currentTime,
			},
			{
				name: "Cookies Delikatess Chew Rolls with Chicken Fillet Strips",
				description:
					"Crispy chew sticks for dogs, wrapped in delicious chicken filet strips for long-lasting chewing enjoyment and gently oven-dried, low in fat and easy to digest, with food-grade quality meat.",
				category: categories[2]._id,
				price: 5.49,
				quantity: 40,
				lastModified: currentTime,
			},
			{
				name: "Rocco Chings Originals Chicken Breast",
				description:
					"These delicious chewy snacks are made from 93% wholesome chicken and are bound to be a firm favourite with your dog - they are grain-free, low in fat and easy to digest.",
				category: categories[2]._id,
				price: 4.79,
				quantity: 40,
				lastModified: currentTime,
			},
			{
				name: "Pedigree Dentastix - Daily Oral Care for Small Dogs",
				description:
					"Dental care sticks by Pedigree, ideal for small dogs, with special texture, with active cleaning ingredients proven to reduce plaque and tartar, low in fat.",
				category: categories[2]._id,
				price: 2.49,
				quantity: 40,
				lastModified: currentTime,
			},
			{
				name: "Dokas Chew Snack Chicken Breast with Fish",
				description:
					"Tasty air-dried chew snack for dogs in a flavoursome chicken and fish combo. Very low in fat and easy to digest.",
				category: categories[2]._id,
				price: 5.99,
				quantity: 40,
				lastModified: currentTime,
			},
			{
				name: "Squeaky Ball Dog Toy",
				description:
					"Green, squeaky dog ball, made from durable thermoplastic rubber (TPR), with a nubby surface which massages your dog's gums. Pleasant to hold, it floats and bounces. Great for water games!",
				category: categories[3]._id,
				price: 1.49,
				quantity: 20,
				lastModified: currentTime,
			},
			{
				name: "KONG Scrunch Knots Fox",
				description:
					"This crazy toy scrunches around an internal coiled rope and has stretchy sides for realistic movement. The toy is fluffy yet durable, and there is an integrated squeaker in the head of the fox.",
				category: categories[3]._id,
				price: 7.29,
				quantity: 20,
				lastModified: currentTime,
			},
			{
				name: "Squirrel Dog Toy",
				description:
					"This crazy toy scrunches around an internal coiled rope and has stretchy sides for realistic movement. The toy is fluffy yet durable, and there is an integrated squeaker in the head of the fox.",
				category: categories[3]._id,
				price: 5.29,
				quantity: 20,
				lastModified: currentTime,
			},
			{
				name: "Giant Snake Dog Toy",
				description:
					"Fun giant snake dog toy in green and black patterned plush with squeakers in the head and tail. Flexible and soft, it is designed to give your dog hours of amusement and play.",
				category: categories[3]._id,
				price: 10.49,
				quantity: 20,
				lastModified: currentTime,
			},
			{
				name: "Little Paws Dog Frisbee",
				description:
					"Flexible frisbee made from robust thermoplastic rubber (TPR). Cute design with bone and pawprint details. Perfect for games of fetch as it is easy to throw a long way and even floats. Easy to clean.",
				category: categories[3]._id,
				price: 4.99,
				quantity: 20,
				lastModified: currentTime,
			},
		];
		await Product.insertMany(products);
	};

	!docExists && (await handleSeeding());
};

const handleSeeding = async () => {
	databaseLog("Seeding collections...");
	await seedingCategories();
	await seedingProducts();
	databaseLog("Seeding collections successfully.");
};

export default handleSeeding;

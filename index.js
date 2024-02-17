const serverLog = require("debug")("project-inventory:server");
const databaseLog = require("debug")("project-inventory:mongoose");

require("dotenv").config();
const app = require("./app");
const mongoose = require("mongoose");

const port = process.env.PORT || "3000";
const uri = process.env.MONGODB_URI || "";

const connectDatabase = async () => {
	databaseLog("Start connecting");
	try {
		await mongoose.connect(uri);
		databaseLog("Connecting successfully");
	} catch (err) {
		databaseLog(`${err.name}: ${err.message}`);
		process.exit(1);
	}
};

const onError = error => {
	switch (error.code) {
		case "EACCES":
			serverLog(`Port ${port} requires elevated privileges`);
			process.exit(1);
		case "EADDRINUSE":
			serverLog(`Port ${port} is already in use`);
			process.exit(1);
		default:
			throw error;
	}
};

const onListening = async () => {
	serverLog(`Listening on http://localhost:${port}`);
	await connectDatabase();
};

app.listen(port, onListening).on("error", onError);

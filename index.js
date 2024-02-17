require("dotenv").config();
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
			server(`Port ${port} requires elevated privileges`);
			process.exit(1);
		case "EADDRINUSE":
			server(`Port ${port} is already in use`);
			process.exit(1);
		default:
			throw error;
	}
};

const onListening = () => {
	server(`Listening on http://localhost:${port}`);
};

app.listen(port, onListening).on("error", onError);

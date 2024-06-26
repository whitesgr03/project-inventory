const serverLog = require("debug")("Server");
const databaseLog = require("debug")("Mongoose");

const os = require("node:os");
const app = require("./app");
const mongoose = require("mongoose");

const PORT = process.env.PORT || "3000";
const URI = process.env.DATABASE_URL;

const IP_Address =
	process.env.NODE_ENV === "development" &&
	os.networkInterfaces().en0.find(interface => interface.family === "IPv4")
		.address;

const connectDatabase = async () => {
	databaseLog("Start connecting");

	const handleError = err => {
		databaseLog(`${err.name}: ${err.message}`);
		process.exit(1);
	};

	mongoose.connect(URI).catch(err => handleError(err));

	mongoose.connection.on("connected", () =>
		databaseLog("Connecting successfully")
	);

	mongoose.connection.on("error", err => handleError(err));
};

const onError = error => {
	switch (error.code) {
		case "EACCES":
			serverLog(`Port ${PORT} requires elevated privileges`);
			process.exit(1);
		case "EADDRINUSE":
			serverLog(`Port ${PORT} is already in use`);
			process.exit(1);
		default:
			throw error;
	}
};

const onListening = async () => {
	process.env.NODE_ENV === "development" &&
		serverLog(`Listening on Local:            http://localhost:${PORT}`);
	process.env.NODE_ENV === "development" &&
		serverLog(
			`Listening on On Your Network:  http://${IP_Address}:${PORT}`
		);
	connectDatabase();
};

app.listen(PORT, onListening).on("error", onError);

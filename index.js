import os from "node:os";
import debug from "debug";
import mongoose from "mongoose";

import db from "./config/database.js";
import app from "./app.js";
import handleSeeding from "./config/seed.js";

const databaseLog = debug("Mongoose");
const serverLog = debug("Server");

const port = process.env.PORT || "3000";

const handleServer = async () => {
	databaseLog("Connecting successfully");
	await handleSeeding();

	const handleListening = async () => {
		const IP_Address = os
			.networkInterfaces()
			.en0.find(internet => internet.family === "IPv4").address;
		serverLog(`Listening on Local:        http://localhost:${port}`);
		serverLog(`Listening on Your Network: http://${IP_Address}:${port}`);
	};
	const handleError = error => {
		serverLog(`Server listening error.`);
		switch (error.code) {
			case "EACCES":
				serverLog(`Port ${port} requires elevated privileges`);
			case "EADDRINUSE":
				serverLog(`Port ${port} is already in use`);
			default:
				serverLog(error);
		}
		app.close();
	};
	const handleClose = () => {
		serverLog(`Server is closed.`);
		mongoose.disconnect();
		databaseLog(`Database is disconnected.`);
		process.exit(1);
	};
	app.listen(port, process.env.NODE_ENV === "development" && handleListening)
		.on("error", handleError)
		.on("close", handleClose);
};

db.on("connected", handleServer).on("error", err => {
	databaseLog("Database error");
	databaseLog(err);
	app.close();
});

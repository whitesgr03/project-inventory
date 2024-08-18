import mongoose from "mongoose";
import debug from "debug";

const databaseLog = debug("Mongoose");

const handleError = err => {
	databaseLog("Database connecting error");
	databaseLog(err);
	mongoose.disconnect();
	databaseLog(`Database is disconnected.`);
	process.exit(1);
};

const db = mongoose.connection;

db.on("connecting", () => databaseLog("Connecting..."));

mongoose.connect(process.env.DATABASE_URL).catch(err => handleError(err));

export default db;

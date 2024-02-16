#!/usr/bin/env node
const app = require("../app");
const server = require("debug")("project-inventory:server");

const port = process.env.PORT || "3000";

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

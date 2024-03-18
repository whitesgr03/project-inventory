const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const errorLog = require("debug")("ServerError");

const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const indexRouter = require("./routes/index");
const inventoryRouter = require("./routes/inventory");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

process.env.NODE_ENV === "production" &&
	app.use(
		rateLimit({
			windowMs: 1 * 60 * 1000,
			limit: 20,
		})
	);

process.env.NODE_ENV === "production" &&
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					imgSrc: [
						"storage.googleapis.com",
						"ik.imagekit.io",
						"data:",
					],
					styleSrc: [
						"'self'",
						"fonts.googleapis.com",
						"necolas.github.io",
					],
				},
			},
		})
	);
app.use(compression());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/inventory", inventoryRouter);

// unknown routes handler
app.use((req, res, next) => {
	next(createError(404, "Page not found", { type: "page" }));
});

// error handler
app.use((err, req, res, next) => {
	res.status(err.status || 500);

	const renderNotFound = () => {
		errorLog(`${err.cause.name}: ${err.cause.message}`);
		res.render("notFound", {
			type: err.type,
		});
	};

	const renderError = () => {
		errorLog(`${err.name}: ${err.message}`);
		res.render("error");
	};

	err.type ? renderNotFound() : renderError();
});

module.exports = app;

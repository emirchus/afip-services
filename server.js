const restana = require("restana"),
	path = require("path"),
	index = require("./routes/index");

(async function () {
	// Lets create Restana
	// This is the HTTP Version check next links to upgrde to HTTPS or even HTTP/2
	// HTTPS: https://github.com/jkyberneees/ana/blob/master/demos/https-service.js
	// HTTP/2: https://github.com/jkyberneees/ana/blob/master/demos/http2-service.js
	const app = restana();

	// Start Routes
	index(app, false);

	console.log("process.env.PORT", process.env.PORT);

	await app.start(process.env.PORT || 3000);

	console.log(
		"AFIP API Corriendo en el puerto " + (process.env.PORT || 3000)
	);
})();

const cors = require('cors'),
	bodyParser = require('body-parser');
const { Protocol } = require('restana');
	const restana = require('restana');
// Setup Route Bindings
/**
 * @param {restana.Service<Protocol.HTTP>} app
 *
 */
exports = module.exports = (app, isServerless = false) => {
	!isServerless && app.use(cors());

	// Add Middlewares
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	app.get('/', (req, res) => {
		res.end(':D');
	});


	// API
	var Endpoint = require('./api/endpoints');
	new Endpoint(app);
};

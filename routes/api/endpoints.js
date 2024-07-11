const soap = require("soap"),
	WSAA = require("../../helpers/wsaa"),
	AfipURLs = require("../../helpers/urls");

const { Protocol } = require("restana");
const restana = require("restana");
class Endpoints {
	/**
	 *
	 * @param {restana.Service<Protocol.HTTP>} app
	 */
	constructor(app) {
		app.get("/api/:service/describe", this.describe.bind(this));

		app.post("/api/:service/refresh/token", this.recreate_token.bind(this));

		app.post("/api/:service/:endpoint", this.endpoint.bind(this));

		this.clients = {};
	}

	createClientForService(service) {
		return new Promise((resolve, reject) => {
			if (this.clients[service]) {
				resolve(this.clients[service]);
			} else {
				soap.createClient(
					AfipURLs.getService(service),
					(err, client) => {
						if (err && !client) {
							reject(err);
						} else {
							this.clients[service] = client;

							resolve(client);
						}
					}
				);
			}
		});
	}

	recreate_token(req, res) {
		var service = req.params.service;

		WSAA.generateToken(service, req.body.keys)
			.then((tokens) => res.send(tokens))
			.catch((err) => {
				res.send({
					result: false,
					err: err.message,
				});
			});
	}

	/**
	 *
	 * @param {restana.Request<Protocol.HTTP>} req
	 * @param {restana.Response<Protocol.HTTP>} res
	 */
	endpoint(req, res) {
		var service = req.params.service;
		var endpoint = req.params.endpoint;

		console.log(req.body);

		const keys = {
			private: req.body.private,
			public: req.body.public,
		};

		const body = JSON.parse(req.body.payload);

		WSAA.generateToken(service, keys)
			.then((tokens) => {
				this.createClientForService(service)
					.then((client) => {
						var params = { ...body.params };
						// params[`${req.body.auth.key}`] = {};
						console.log(params);
						params[`${body.auth.key}`][`${body.auth.token}`] =
							tokens.token;
						params[`${body.auth.key}`][`${body.auth.sign}`] =
							tokens.sign;

						console.info("Enviando petición a ", endpoint, params);
						client[endpoint](params, (err, result) => {
							try {
								res.send(result[`${endpoint}Result`]);
							} catch (e) {
								res.send(result);
							}

							console.info(
								"Respuesta de ",
								endpoint,
								result,
								err
							);
						});
					})
					.catch((err) => {
						console.info(JSON.stringify(err));
						res.send({ result: false });
					});
			})
			.catch((err) => {
				res.send({
					result: false,
					err: err.message,
				});
			});
	}

	describe(req, res) {
		var service = req.params.service;

		WSAA.generateToken(service, req.body.keys)
			.then((tokens) => {
				this.createClientForService(service).then((client) => {
					res.send(client.describe());
				});
			})
			.catch((err) => {
				res.send({
					result: false,
					err: err.message,
				});
			});
	}
}

module.exports = Endpoints;

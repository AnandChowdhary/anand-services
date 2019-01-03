const request = require("request");

module.exports = (req, res) => {
	request(
		{
			uri: `https://gitlab.elnino.tech/api/v4/events?action=pushed&after=2018-12-20&before=2019-01-03&private_token=${
				process.env.GITLAB_TOKEN
			}`
		},
		(error, response, body) => {
			res.json(["done", body]);
			console.log(error, body);
		}
	);
};

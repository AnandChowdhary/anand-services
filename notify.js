const request = require("request");

// Sends an IFTTT notification to my phone
module.exports = text => {
	request.post(
		"https://maker.ifttt.com/trigger/notification_endpoint/with/key/cIslveLjbfBDQsMx1-toPLh1VpRquJBDLp8NCddG2wN",
		{
			json: true,
			body: {
				value1: text,
				value2: "",
				value3: ""
			}
		}
	);
};

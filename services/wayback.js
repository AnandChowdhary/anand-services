const http = require("http");
const request = require("request");
const Sitemapper = require("sitemapper");

const websiteUrl = "https://anandchowdhary.com";
const waybackMachineUrl = "http://web.archive.org/save/";
const sitemap = new Sitemapper();

module.exports = (req, res) => {
	const url = waybackMachineUrl + (req.body.url || websiteUrl);
	sitemap.fetch(`${websiteUrl}/sitemap.xml`).then(result => {
		const sites = result.sites;
		res.json({ pages: sites.length });
		for (let i = 0; i < sites.length; i++) {
			request({ uri: waybackMachineUrl + sites[i] }, function(error, response, body) {
				console.log("done", sites[i]);
			});
		}
	});
};

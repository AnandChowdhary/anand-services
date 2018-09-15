const streams = require("memory-streams");
const PImage = require("pureimage");
const img1 = PImage.make(500, 130);

module.exports = (req, res) => {
	const writer = new streams.WritableStream();

	const ctx = img1.getContext("2d");
	ctx.fillStyle = "rgba(255,0,0, 0.5)";
	ctx.fillRect(0, 0, 500, 130);
	var fnt = PImage.registerFont(__dirname + "/font.ttf", "Source Sans Pro");
	fnt.load(() => {
		ctx.fillStyle = "#ffffff";
		ctx.font = "48pt 'Source Sans Pro'";
		ctx.fillText(new Date().toLocaleString(), 50, 80);
		PImage.encodePNGToStream(img1, writer)
			.then(() => {
				res.setHeader("content-type", "image/png");
				res.set("Cache-Control", "no-cache");
				res.send(writer.toBuffer());
			})
			.catch(e => {
				console.log("there was an error writing", e);
			});
	});
};

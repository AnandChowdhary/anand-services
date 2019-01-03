const CronJob = require("cron").CronJob;
const notify = require("../notify");

module.exports = () => {
	new CronJob("0 * * * *", () => {
		require("./hour")();
		notify("Running cron " + "hour " + new Date());
		console.log("Running cron", "hour", new Date());
	}).start();
	new CronJob("0 0 * * *", () => {
		require("./day")();
		notify("Running cron " + "day " + new Date());
		console.log("Running cron", "day", new Date());
	}).start();
	new CronJob("0 0 * * 1", () => {
		require("./week")();
		notify("Running cron " + "week " + new Date());
		console.log("Running cron", "week", new Date());
	}).start();
};

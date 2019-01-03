const express = require("express");
const cors = require("cors");
const RateLimit = require("express-rate-limit");
const constants = require("./constants");
const crons = require("./crons");

const app = express();
app.use(express.json());
app.use(cors());
app.enable("trust proxy");
crons();

const limiter = new RateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 30, // limit each IP to 30 requests per minute
	delayMs: 0 // disable delaying - full speed until the max limit is reached
});

app.get(constants.endpoints.API_HOME, (req, res) => {
	res.json({ endpoints: constants.endpoints });
});

app.get(constants.endpoints.API_WAYBACK, (req, res) => require("./services/wayback")(req, res));
app.get(constants.endpoints.API_DATEIMAGE, (req, res) => require("./services/dateimage")(req, res));
app.get(constants.endpoints.API_GITLAB, (req, res) => require("./services/gitlab")(req, res));

app.set("json spaces", 4);
app.listen(process.env.PORT || 3000, () => console.log("App launched!"));

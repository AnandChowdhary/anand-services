const request = require("request");
const dayjs = require("dayjs");

const yesterday = "2018-12-20";
const today = dayjs().format("YYYY-MM-DD");

module.exports = (req, res) => {
	request(
		{
			uri: `https://gitlab.elnino.tech/api/v4/events?action=pushed&after=${yesterday}&before=${today}&private_token=${
				process.env.GITLAB_TOKEN
			}`
		},
		(error, response, body) => {
			const commits = [];
			try {
				body = JSON.parse(body);
				body.forEach(push => {
					if (push.push_data) {
						for (let i = 0; i < push.push_data.commit_count; i++) {
							commits.push({
								message: `GitLab commit: ${push.push_data.commit_to} in ${
									push.project_id
								} by ${push.author.name} (@${push.author.username})`,
								time: dayjs(push.created_at).add(i, "minutes")
							});
						}
					}
				});
			} catch (e) {}
			res.json(commits);
		}
	);
};

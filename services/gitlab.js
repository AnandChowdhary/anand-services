const request = require("request");
const dayjs = require("dayjs");
const sha1 = require("sha1");

const promiseSerial = funcs =>
	funcs.reduce(
		(promise, func) => promise.then(result => func().then(Array.prototype.concat.bind(result))),
		Promise.resolve([])
	);

const yesterday = dayjs()
	.subtract(1, "day")
	.format("YYYY-MM-DD");
const today = dayjs()
	.add(12, "hour")
	.format("YYYY-MM-DD");
let previousSha = "";

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
								} by ${push.author.name} (@${push.author.username}) at ${dayjs(
									push.created_at
								).add(i, "minute")}`
							});
						}
					}
				});
			} catch (e) {}
			let index = 1;
			const githubCommits = commits.map(commit => () =>
				new Promise((resolve, reject) => {
					const newString = commit.message;
					request(
						{
							method: "PUT",
							uri: `https://api.github.com/repos/AnandChowdhary/gitlab-commits/contents/file.txt?access_token=${
								process.env.GITHUB_TOKEN
							}`,
							body: {
								content: Buffer.from(newString).toString("base64"),
								sha: previousSha,
								message: commit.message,
								signature: process.env.PGP_SIGNATURE
							},
							json: true,
							headers: {
								// GitHub likes it if you set your username as the user-agent
								"User-Agent": "AnandChowdhary"
							}
						},
						(error, response, body) => {
							previousSha = body.content.sha;
							console.log(
								`(${index}/${commits.length}) ${
									commit.message.split("GitLab commit: ")[1].split(" ")[0]
								}`
							);
							index++;
							if (error) return reject();
							resolve();
						}
					);
				})
			);

			res.json(commits);

			request(
				{
					uri:
						"https://api.github.com/repos/AnandChowdhary/gitlab-commits/contents/file.txt?access_token=" +
						process.env.GITHUB_TOKEN,
					headers: {
						"User-Agent": "AnandChowdhary"
					}
				},
				(error, response, body) => {
					if (error) res.json("Error", error);
					previousSha = JSON.parse(body).sha;
					promiseSerial(githubCommits)
						.then(() => {
							// Sends an IFTTT notification to my phone
							request.post(
								"https://maker.ifttt.com/trigger/notification_endpoint/with/key/cIslveLjbfBDQsMx1-toPLh1VpRquJBDLp8NCddG2wN",
								{
									json: true,
									body: {
										value1: "Completed CRON job ",
										value2: "for GitLab; number of commits today: ",
										value3: commits.length
									}
								}
							);
							console.log("Completed!");
						})
						.catch(error => {
							console.log("Error!", error);
						});
				}
			);
		}
	);
};

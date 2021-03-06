const request = require("request");
const dayjs = require("dayjs");
const notify = require("../notify");

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

const tokenVerify = () => {
	request(
		{
			uri:
				"https://api.github.com/repos/AnandChowdhary/gitlab-commits/contents/token.txt?access_token=" +
				process.env.GITHUB_TOKEN,
			headers: {
				"User-Agent": "AnandChowdhary"
			}
		},
		(error, response, body) => {
			if (error) return;
			const tokenFileSha = JSON.parse(body).sha;
			request(
				{
					method: "PUT",
					uri: `https://api.github.com/repos/AnandChowdhary/gitlab-commits/contents/token.txt?access_token=${
						process.env.GITHUB_TOKEN
					}`,
					body: {
						content: Buffer.from(new Date().toString()).toString("base64"),
						sha: tokenFileSha,
						message: "Checking if token still works",
						signature: process.env.PGP_SIGNATURE
					},
					json: true,
					headers: {
						// GitHub likes it if you set your username as the user-agent
						"User-Agent": "AnandChowdhary"
					}
				},
				(error, response, body) => {
					if (error) {
						notify(
							"GitHub write token doesn't work anymore!"
						);
					}
				}
			);
		}
	);
}

module.exports = (req, res) => {
	tokenVerify();
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

module.exports = () => {
	// Run wayback daily
	require("../services/wayback")(
		{
			body: {}
		},
		{
			json: text => {
				console.log(text);
			}
		}
	);
	// Run GitLab daily
	require("../services/gitlab")(
		{
			body: {}
		},
		{
			json: text => {
				console.log(text);
			}
		}
	);
};

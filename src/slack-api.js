var fetch = require('isomorphic-fetch');
var queryString = require('query-string');

module.exports = {
	getUserInfo: function(userId) {
		var params = queryString.stringify({
			token: process.env.SLACK_API_TOKEN,
			user: userId
		});

		return fetch(`https://slack.com/api/users.info?${ params }`)
			.then(response => {
				if (response.status === 200) {
					return response.json();
				}
				else {
					throw new Error('Cannot connect to the Slack API.');
				}
			})
			.then(slackApiResponse => slackApiResponse.user.real_name);
	},
	sendResponse: function(url, text) {
		return fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text })
		});
	},
	setStatus: function(text) {
		return fetch('slack.com/api/users.profile.set', {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: text
		});
	}
};
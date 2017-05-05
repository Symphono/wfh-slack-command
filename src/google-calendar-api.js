var GoogleAuth = require('google-auth-library');
var google = require('googleapis');
var calendar = google.calendar('v3').events;
var moment = require('moment');

var credentials = new Promise((resolve, reject) => {
	const authFactory = new GoogleAuth();
	const jwtClient = new authFactory.JWT(
		process.env.GOOGLE_CLIENT_EMAIL,
		null,
		process.env.GOOGLE_PRIVATE_KEY,
		['https://www.googleapis.com/auth/calendar']
	);

	jwtClient.authorize(error => error ? reject(error) : resolve(jwtClient));
});

module.exports = {
	checkIfWfhEventExists: employeeName => {
		return new Promise(resolve =>
			credentials.then(auth =>
				calendar.list({
					auth,
					calendarId: process.env.GOOGLE_CLIENT_EMAIL,
					singleEvents: true,
					timeMin: moment().startOf('day').format(),
					timeMax: moment().add(1, 'day').startOf('day').format()
				}, (err, response) => {
					var existingId;

					if (response) {
						existingId = response.items
							.filter(i => i.summary === `${ employeeName } - WFH`)
							.map(i => i.id)[0];
					}

					resolve(existingId);
				})
			)
		);
	},
	deleteWfhEvent: eventId => {
		return new Promise((resolve, reject) =>
			credentials.then(auth =>
				calendar.delete({
					auth,
					calendarId: process.env.GOOGLE_CLIENT_EMAIL,
					eventId
				}, error => {
					if (error) {
						reject(error);
					}
					else {
						resolve();
					}
				})
			)
		);
	},
	createWfhEvent: employeeName => {
		return new Promise((resolve, reject) =>
			credentials.then(auth =>
				calendar.insert({
					auth,
					calendarId: 'primary',
					resource: {
						attendees: [{ email: process.env.GOOGLE_TARGET_CALENDAR }],
						description: 'Added by your friendly, neighborhood Slackbot 🏡',
						end: { date: moment().add(1, 'day').format('YYYY-MM-DD') },
						start: { date: moment().format('YYYY-MM-DD') },
						summary: `${ employeeName } - WFH`
					}
				}, (err, response) => {
					if (err) {
						reject(err);
					}
					else {
						resolve(response);
					}
				})
			)
		);
	}
};
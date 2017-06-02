var googleApi = require('./google-calendar-api');
var slackApi = require('./slack-api');
var moment = require('moment');

var toggleWfhEvent = (eventId, employeeName, date) => {
	var action, message;

	if (eventId) {
		action = googleApi.deleteWfhEvent(eventId);
		message = `🚗 Okay! Looks like you're going to the office on ${ date.format('MMMM Do YYYY') }. 🏢`;
	} else {
		action = googleApi.createWfhEvent(employeeName, date);
		message = `✅ Okay! You're on the calendar as WFH for ${ date.format('MMMM Do YYYY') }. _Don't slack off_! 🏡`;
	}

	return action.then(() => message);
};

var toggleWfhEventInInterval = (eventId, employeeName, startDateTime, endDateTime) => {
	var action, message;

	if (eventId) {
		action = googleApi.deleteWfhEvent(eventId);
		if (startDateTime.format() === endDateTime.format())
		{
			message = `🚗 Okay! Looks like you're going to the office on ${ startDateTime.format('MMMM Do YYYY') } from ${ startDateTime.format('h:mm a') } to ${ endDateTime.format('h:mm a') }. 🏢`
		}
		else
		{
			message = `🚗 Okay! Looks like you're going to the office from ${ startDateTime.format('MMMM Do YYYY, h:mm a') } to ${ endDateTime.format('MMMM Do YYYY, h:mm a') } . 🏢`
		}
	} else {
		action = googleApi.createWfhEvent(employeeName, startDateTime, endDateTime);
		if (startDateTime.format() === endDateTime.format())
		{
			message = `✅ Okay! You're on the calendar as WFH on ${ startDateTime.format('MMMM Do YYYY') } from ${ startDateTime.format('h:mm a') } to ${ endDateTime.format('h:mm a') }. _Don't slack off_! 🏡`
		}
		else
		{
			message = `✅ Okay! You're on the calendar as WFH from ${ startDateTime.format('MMMM Do YYYY, h:mm a') } to ${ endDateTime.format('MMMM Do YYYY, h:mm a') }. _Don't slack off_! 🏡`;
		}
	}

	return action.then(() => message);
};

var clearCalendarEvent = (eventId, date) => {
	var action, message;

	if (eventId) {
		action = googleApi.deleteWfhEvent(eventId);
	}
	else {
		action = Promise.resolve();
	}
	message = `🚗 Okay! Looks like you're going to the office ${ date.format('MMMM Do YYYY') }. 🏢`;

	return action.then(() => message);
}

module.exports = {
	handleRequest: function (userID, slackResponseEndpoint, date) {
		return slackApi
			.getUserInfo(userID)
			.then(employeeName =>
				googleApi.checkIfWfhEventExists(employeeName, date)
					.then(eventId => toggleWfhEvent(eventId, employeeName, date))
					.then(message => slackApi.sendResponse(slackResponseEndpoint, message))
			)
			.catch(error => {
				console.log(error);
				return slackApi.sendResponse(slackResponseEndpoint, '💥 Uh oh, just FYI, something went wrong and you\'re not on the calendar as WFH.');
			})
	},
	handleRequestInInterval: function (userID, slackResponseEndpoint, startDateTime, endDateTime) {
		return slackApi
			.getUserInfo(userID)
			.then(employeeName =>
				googleApi.checkIfWfhEventExists(employeeName, startDateTime, endDateTime)
					.then(eventId => toggleWfhEventInInterval(eventId, employeeName, startDateTime, endDateTime))
					.then(message => slackApi.sendResponse(slackResponseEndpoint, message))
			)
			.catch(error => {
				console.log(error);
				return slackApi.sendResponse(slackResponseEndpoint, '💥 Uh oh, just FYI, something went wrong and you\'re not on the calendar as WFH.');
			})
	},
	clear: function (userID, slackResponseEndpoint, startDateTime, endDateTime) {
		return slackApi
			.getUserInfo(userID)
			.then(employeeName =>
				googleApi.checkIfWfhEventExists(employeeName, startDateTime, endDateTime)
					.then(eventId => clearCalendarEvent(eventId, startDateTime))
					.then(message => slackApi.sendResponse(slackResponseEndpoint, message))
			);
	}
};

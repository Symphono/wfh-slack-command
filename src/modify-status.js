var slackApi = require('./slack-api');
var emoji = require('node-emoji');

var getDefaultStatus = function () {
	var status = {
		status_text: 'Working from home',
		status_emoji: ':house_with_garden:'
	}
	return status;
}

var getBlankStatus = function () {
	var blankStatus = {
		status_text: '',
		status_emoji: ''
	}
	return blankStatus;
}

var getEmojiLength = function (text) {
	var emojiLength = 0;
	for (var i = 0; i < text.length; i += 1)
	{
		if (text.codePointAt(i) > 255)
		{
			emojiLength += 1;
		}
		else
		{
			break;
		}
	}

	return emojiLength;
}

var buildStatusJSON = function (text) {
	if (text === 'clear')
	{
		return getBlankStatus();
	}

	var status = getDefaultStatus();
	var messageBegin = getEmojiLength(text);
	if (text.codePointAt(0) > 255)
	{
		status.status_emoji = ':'.concat(emoji.which(text.substr(0, messageBegin)), ':');
		if (text.substr(messageBegin, 1) === ' ')
		{
			messageBegin += 1;
		}
	}
	if (text.substring(messageBegin).length > 0)
	{
		status.status_text = text.substring(messageBegin);
	}
	return status;
}

module.exports = (text, token) => {
	var status = buildStatusJSON(text);
	var encodedJSON = 'token='.concat(token, '&profile=', encodeURIComponent(JSON.stringify(status)));
	return slackApi.sendResponse('slack.com/api/users.profile.set', encodedJSON);
};

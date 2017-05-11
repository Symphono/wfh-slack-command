var slackApi = require('./slack-api');
var emoji = require('node-emoji');

function getDefaultStatus() {
	var status = {
		status_text: 'Working from home',
		status_emoji: ':house_with_garden:'
	}
	return status;
}

function getBlankStatus() {
	var blankStatus = {
		status_text: '',
		status_emoji: ''
	}
	return blankStatus;
}

function isEmojiChar(character) {
	return character > 255;
}

function getEmojiLength(text) {
	var emojiLength = 0;
	for (var i = 0; i < text.length; i += 1)
	{
		if (isEmojiChar(text.codePointAt(i)))
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

function buildStatusJSON (text) {
	if (text === 'clear')
	{
		return getBlankStatus();
	}
	var status = getDefaultStatus();
	var messageBegin = getEmojiLength(text);
	if (isEmojiChar(text.codePointAt(0))) {
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

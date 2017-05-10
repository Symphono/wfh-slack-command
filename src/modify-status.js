var slackApi = require('./slack-api');
var emoji = require('node-emoji');

var status = {
    status_text: 'Working from Home',
    status_emoji: ':house_with_garden:'
	}

var defaultStatus = function () {
		status.status_text = 'Working from home';
		status.status_emoji = ':house_with_garden:';
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

var setStatusEmojiAndText = function (text) {
	if (text === 'clear')
	{
		status.status_text = '';
		status.status_emoji = '';
	}
	else
	{
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
	}
}

module.exports = (text, token) => {
	setStatusEmojiAndText(text);
	var encodedJSON = 'token='.concat(token, '&profile=', encodeURIComponent(JSON.stringify(status)));
	defaultStatus();
	return slackApi.sendResponse('slack.com/api/users.profile.set', encodedJSON);
};

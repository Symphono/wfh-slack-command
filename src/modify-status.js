var slackApi = require('./slack-api');
var emoji = require('node-emoji');

var parseText = function (text) {

	var unicodeCount = 0;
	for (var i = 0; i < text.length; i += 1)
	{
		if (text.codePointAt(i) > 255)
		{
			unicodeCount += 1;
		}
		else
		{
			break;
		}
	}
	return unicodeCount;
}

var getStatusEmojiAndText = function (text, unicodeCount) {
	var statusEmoji = '';
	var statusText = '';
	if (text.codePointAt(0) > 255)
	{
		statusEmoji = text.substr(0, unicodeCount);
		if (text.substr(unicodeCount, 1) === ' ')
		{
			statusText = text.substring(unicodeCount + 1);
		}
		else
		{
			statusText = text.substring(unicodeCount);
		}
		if (statusText === '')
		{
			statusText = 'Working from home';
		}
	}
	else
	{
		// Status Emoji not specified at beginning of text, error
	}
	return { statusEmoji: statusEmoji, statusText: statusText };
}

module.exports = (text, token) => {
	var encodedJSON = 'token='.concat(token, '&profile=', encodeURIComponent('{"status_text":"'.concat('', '","status_emoji":"', '', '"}')));
	if (text !== 'clear' && text !== '')
	{
		var unicodeCount = parseText(text);
		var statusEmoji = getStatusEmojiAndText(text, unicodeCount).statusEmoji;
		var statusText = getStatusEmojiAndText(text, unicodeCount).statusText;
		encodedJSON = 'token='.concat(token, '&profile=', encodeURIComponent('{"status_text":"'.concat(statusText, '","status_emoji":":', emoji.which(statusEmoji), ':"}')));
	}
	console.log('encoded profile URI component');
	console.log(encodedJSON);
	slackApi.sendResponse('slack.com/api/users.profile.set', encodedJSON);
};

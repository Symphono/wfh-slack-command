var chance = require('chance')();
var chai = require('chai');
var rewire = require('rewire');
var sinon = require('sinon');
var emoji = require('node-emoji');

chai.use(require('chai-as-promised'));

var modifyStatus = rewire('../src/modify-status');

describe('Handling request', () => {
	var fakeSlackApi, token, text, status, randomEmoji;
	var act = () => modifyStatus(text, token);
	var refreshMocks = () => {
		fakeSlackApi = {
			getUserInfo: sinon.stub(),
			sendResponse: sinon.stub()
		};
		modifyStatus.__set__({
			slackApi: fakeSlackApi
		});
	}

	describe('When processing a request', () => {
		beforeEach(() => {
			token = chance.string();
			text = chance.sentence();
			status = {
				status_text: 'Working from home',
				status_emoji: ':house_with_garden:'
			}
			refreshMocks();
		});
		describe('And the user set a status', () => {
			describe('And the user also set an emoji', () => {
				var someToken = chance.string();
				var someText = chance.sentence();
				var someEmoji = emoji.random().emoji;
				describe('And the WFH is \''.concat(someEmoji, someText, '\' and token is \'', someToken, '\''), () => {
						beforeEach(() => {
							token = someToken;
							text = someText;
							status.status_text = text;
							status.status_emoji = ':'.concat(emoji.which(someEmoji), ':');
							text = someEmoji.concat(text);
							return act();
						});
						it('should set status text and emoji to supplied text (slack api example)', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent(JSON.stringify(status))))
						);
					});
					describe('And the WFH contains an emoji followed by a space and a status message', () => {
						beforeEach(() => {
							token = chance.string();
							text = chance.sentence();
							randomEmoji = emoji.random().emoji;
							status.status_text = text;
							status.status_emoji = ':'.concat(emoji.which(randomEmoji), ':');
							text = randomEmoji.concat(' ', text);
							return act();
						});
						it('should set status emoji and message to supplied text, excluding space between emoji and message', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent(JSON.stringify(status))))
						);

					});
					describe('And the WFH contains an emoji followed immediately by a status message', () => {
						beforeEach(() => {
							token = chance.string();
							text = chance.sentence();
							randomEmoji = emoji.random().emoji;
							status.status_text = text;
							status.status_emoji = ':'.concat(emoji.which(randomEmoji), ':');
							text = randomEmoji.concat(text);
							return act();
						});
						it('should set status emoji and message to supplied text', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent(JSON.stringify(status))))
						);
					});
					describe('And the WFH contains the status message before the emoji', () => {
						beforeEach(() => {
							token = chance.string();
							text = chance.sentence();
							randomEmoji = emoji.random().emoji;
							text = text.concat(emoji.random().emoji);
							status.status_text = text;
							return act();
						});
						it('should set status emoji to default :house_with_garden: and status message to following text', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent(JSON.stringify(status))))
						);
					});
					describe('And the WFH contains multiple emojis', () => {
						beforeEach(() => {
							token = chance.string();
							text = chance.sentence();
							randomEmoji = emoji.random().emoji;
							status.status_text = text;
							status.status_emoji = ':'.concat(emoji.which(randomEmoji), ':');
							text = randomEmoji.concat(randomEmoji, text);
							return act();
						});
						it('should set status emoji to first emoji and status message to remainder of text without emojis directly after the first', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent(JSON.stringify(status))))
						);
					});
			});
			describe('And the WFH contains a message with no emoji', () => {
				beforeEach(() => {
					token = chance.string();
					text = chance.sentence();
					status.status_text = text;
					return act();
				});
				it('should set status message to supplied text and status emoji to default :house_with_garden:', () =>
					sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent(JSON.stringify(status))))
				);
			});
		});
		describe('And the WFH contains just an emoji', () => {
			beforeEach(() => {
				token = chance.string();
				randomEmoji = emoji.random().emoji;
				text = randomEmoji;
				status.status_emoji = ':'.concat(emoji.which(randomEmoji), ':');
				return act();
			});
			it('should set status emoji to specified and status message to default \'Working from home\'', () =>
				sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent(JSON.stringify(status))))
			);
		});
		describe('And the user cleared the WFH', () => {
			beforeEach(() => {
				token = chance.string();
				text = 'clear';
				status.status_text = '';
				status.status_emoji = '';
				return act();
			});
			it('should clear status', () =>
				sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent(JSON.stringify(status))))
			);
		});
		describe('And the user does not set a status or emoji', () => {
			beforeEach(() => {
				text = '';
				return act();
			});
			it('should set status emoji to default :house_with_garden: and status message to \'Working from home\'', () =>
				sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent(JSON.stringify(status))))
			);
		});
	});
});

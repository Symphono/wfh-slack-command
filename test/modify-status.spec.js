var Chance = require('chance');
var chai = require('chai');
var rewire = require('rewire');
var sinon = require('sinon');
var emoji = require('node-emoji');

chai.use(require('chai-as-promised'));

var chance = new Chance();
var modifyStatus = rewire('../src/modify-status');

describe('Handling request', () => {
	var fakeSlackApi, token, text;
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
			text = 'some status message';
			refreshMocks();
		});
		describe('And the user passes in a nonempty text', () => {
					var randomEmoji = emoji.random().emoji;
					describe('And the text is \'🚞 riding a train\' and token is \'super_secret_token\'', () => {
						beforeEach(() => {
							token = 'super_secret_token'
							text = '🚞 riding a train';
							return act();
						});
						it('should send back to slack the following URI \'token=super_secret_token&profile=%7B%22status_text%22%3A%22riding%20a%20train%22%2C%22status_emoji%22%3A%22%3Amountain_railway%3A%22%7D\'', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token=super_secret_token&profile=%7B%22status_text%22%3A%22riding%20a%20train%22%2C%22status_emoji%22%3A%22%3Amountain_railway%3A%22%7D')
						);
					});
					describe('And the text contains an emoji followed by a space and a status message', () => {
						beforeEach(() => {
							text = randomEmoji.concat(' ', text);
							return act();
						});
						it('should send back to slack an encoded URI in which the profile parameter is set to a payload of statusEmoji and statusText', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent('{"status_text":"'.concat('some status message', '","status_emoji":":', emoji.which(randomEmoji), ':"}')))));

					});
					describe('And the text contains an emoji followed immediately by a status message', () => {
						beforeEach(() => {
							text = randomEmoji.concat(text);
							return act();
						});
						it('should send back to slack an encoded URI in which the profile parameter is set to a payload of statusEmoji and statusText', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent('{"status_text":"'.concat('some status message', '","status_emoji":":', emoji.which(randomEmoji), ':"}'))))
						);
					});
					describe('And the text contains a message with no emoji', () => {
						beforeEach(() => {
							return act();
						});
						it('should send back to slack an encoded URI in which the profile parameter is set to a payload of empty strings for statusEmoji and statusText', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent('{"status_text":"'.concat('', '","status_emoji":"', '', '"}'))))
						);
					});
					describe('And the text contains just an emoji', () => {
						beforeEach(() => {
							text = randomEmoji;
							return act();
						});
						it('should send back to slack and encoded URI in which the profile parameter is set to a payload of statusEmoji and empty string statusText', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent('{"status_text":"'.concat('Working from home', '","status_emoji":":', emoji.which(randomEmoji), ':"}'))))
						);
					});
					describe('And the text contains multiple emojis', () => {
						beforeEach(() => {
							text = randomEmoji.concat(randomEmoji, text);
							return act();
						});
						it('should send back to slack an encoded URI in which the profile parameter is set to a payload of statusEmoji and statusText, where statusText contains the emojis after the first', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent('{"status_text":"'.concat(randomEmoji, 'some status message', '","status_emoji":":', emoji.which(randomEmoji), ':"}'))))
						);
					});
					describe('And the text contains the status message before the emoji', () => {
						beforeEach(() => {
							text = text.concat(emoji.random().emoji);
							return act();
						});
						it('should send back to slack an encoded URI in which the profile parameter is set to a payload of empty strings for statusEmoji and statusText', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent('{"status_text":"'.concat('', '","status_emoji":"', '', '"}'))))
						);
					});
					describe('And the user passes in \'clear\'', () => {
						beforeEach(() => {
							text = 'clear';
							return act();
						});
						it('should send back to slack an encoded URI in which the profile parameter is set to a payload of empty strings for statusEmoji and statusText', () =>
							sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent('{"status_text":"'.concat('', '","status_emoji":"', '', '"}'))))
						);
					});
		});
		describe('And the user passes in an empty text', () => {
			beforeEach(() => {
				text = '';
				return act();
			});
			it('should send back to slack an encoded URI in which the profile parameter is set to a payload of empty strings for statusEmoji and statusText', () =>
				sinon.assert.calledWith(fakeSlackApi.sendResponse, 'slack.com/api/users.profile.set', 'token='.concat(token, '&profile=', encodeURIComponent('{"status_text":"'.concat('', '","status_emoji":"', '', '"}'))))
			);
		});



	});
});

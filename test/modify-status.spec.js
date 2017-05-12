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
			setStatus: sinon.stub()
		};
		modifyStatus.__set__({
			slackApi: fakeSlackApi
		});
	}

	describe('When processing a request', () => {
		describe('And the user set a status', () => {
			describe('And the user also set an emoji', () => {
				beforeEach(() => {
					token = chance.string();
					text = chance.sentence();
					randomEmoji = emoji.random().emoji;
					status = {
						status_text: 'Working from home',
						status_emoji: ':house_with_garden:'
					}
					refreshMocks();
				});
				describe('And the WFH is \':random_emoji:random_message\' and token is \'random_token\'', () => {
						beforeEach(() => {
							status.status_text = text;
							status.status_emoji = `:${ emoji.which(randomEmoji) }:`;
							text = `${ randomEmoji } ${ text }`;
							return act();
						});
						it('should set status emoji and message to supplied text, excluding space between emoji and message', () =>
							sinon.assert.calledWith(fakeSlackApi.setStatus, `token=${ token }&profile=${ encodeURIComponent(JSON.stringify(status)) }`)
						);
					});
					describe('And the WFH contains an emoji followed by a space and a status message', () => {
						beforeEach(() => {
							status.status_text = text;
							status.status_emoji = `:${ emoji.which(randomEmoji) }:`;
							text = `${ randomEmoji } ${ text }`;
							return act();
						});
						it('should set status emoji and message to supplied text, excluding space between emoji and message', () =>
							sinon.assert.calledWith(fakeSlackApi.setStatus, `token=${ token }&profile=${ encodeURIComponent(JSON.stringify(status)) }`)
						);

					});
					describe('And the WFH contains an emoji followed immediately by a status message', () => {
						beforeEach(() => {
							status.status_text = text;
							status.status_emoji = `:${ emoji.which(randomEmoji) }:`;
							text = `${ randomEmoji }${ text }`;
							return act();
						});
						it('should set status emoji and message to supplied text', () =>
							sinon.assert.calledWith(fakeSlackApi.setStatus, `token=${ token }&profile=${ encodeURIComponent(JSON.stringify(status)) }`)
						);
					});
					describe('And the WFH contains the status message before the emoji', () => {
						beforeEach(() => {
							text = `${ text }${ randomEmoji }`;
							status.status_text = text;
							return act();
						});
						it('should set status emoji to default :house_with_garden: and status message to following text', () =>
							sinon.assert.calledWith(fakeSlackApi.setStatus, `token=${ token }&profile=${ encodeURIComponent(JSON.stringify(status)) }`)
						);
					});
					describe('And the WFH contains multiple emojis', () => {
						beforeEach(() => {
							status.status_text = text;
							status.status_emoji = `:${ emoji.which(randomEmoji) }:`;
							text = `${ randomEmoji }${ randomEmoji }${ text }`;
							return act();
						});
						it('should set status emoji to first emoji and status message to remainder of text without emojis directly after the first', () =>
							sinon.assert.calledWith(fakeSlackApi.setStatus, `token=${ token }&profile=${ encodeURIComponent(JSON.stringify(status)) }`)
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
					sinon.assert.calledWith(fakeSlackApi.setStatus, `token=${ token }&profile=${ encodeURIComponent(JSON.stringify(status)) }`)
				);
			});
		});
		beforeEach(() => {
			token = chance.string();
			randomEmoji = emoji.random().emoji;
			status = {
				status_text: 'Working from home',
				status_emoji: ':house_with_garden:'
			}
			refreshMocks();
		});
		describe('And the WFH contains just an emoji', () => {
			beforeEach(() => {
				text = randomEmoji;
				status.status_emoji = `:${ emoji.which(randomEmoji) }:`;
				return act();
			});
			it('should set status emoji to specified and status message to default \'Working from home\'', () =>
				sinon.assert.calledWith(fakeSlackApi.setStatus, `token=${ token }&profile=${ encodeURIComponent(JSON.stringify(status)) }`)
			);
		});
		describe('And the user cleared the WFH', () => {
			beforeEach(() => {
				text = 'clear';
				status.status_text = '';
				status.status_emoji = '';
				return act();
			});
			it('should clear status', () =>
				sinon.assert.calledWith(fakeSlackApi.setStatus, `token=${ token }&profile=${ encodeURIComponent(JSON.stringify(status)) }`)
			);
		});
		describe('And the user does not set a status or emoji', () => {
			beforeEach(() => {
				text = '';
				return act();
			});
			it('should set status emoji to default :house_with_garden: and status message to \'Working from home\'', () =>
				sinon.assert.calledWith(fakeSlackApi.setStatus, `token=${ token }&profile=${ encodeURIComponent(JSON.stringify(status)) }`)
			);
		});
	});
});

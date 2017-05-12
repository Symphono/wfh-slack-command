var bodyParser = require('body-parser');
var app = require('express')();
var handleWfhRequest = require('./handle-wfh-request');
var modifyStatus = require('./modify-status');

app.use(bodyParser.urlencoded({ extended: true }));
app.listen(process.env.PORT);

app.post('/wfh', (req, res) => {
	res.send();
	handleWfhRequest(req.body.user_id, req.body.response_url);
	modifyStatus(req.body.text, req.body.token);
});
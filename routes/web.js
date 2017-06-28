var express 	= 	require('express');
var https		=	require('https');
var config 		=	require('./../config/request');
var helper 		=	require('./../helper/router');

var router 		= 	express.Router();

router.get('/', function(req, res) {
	res.redirect('/app');
});

router.get('/app', function(req, res) {

	var request = https.request(helper.getOptions('/apps/versions?developerId=' + config.DEVELOPER_ID, 'GET'), function(response) {
		response.setEncoding('utf8');
		response.on('data', function(chunk) {
			var data = JSON.parse(chunk);
			var get = https.request(helper.getOptions('/stats/series/month/views?query=' + encodeURIComponent("{developerId: '" + config.DEVELOPER_ID + "'}"), 'GET'), function(response) {
				response.setEncoding('utf8');
				response.on('data', function(chunk) {
					console.log('Response: ' + chunk);
					res.render('app/app-show', {data: data, statistics: chunk });
				})
			});

			get.end();
		});
	});

	request.end();
});

router.get('/app/create', function(req, res) {
    res.render('app/app-create');
});

router.get('/app/edit/:id', function(req, res) {
	var request = https.request(helper.getOptions('/apps/' + req.params.id + '/versions/1' + '?developerId=' + config.DEVELOPER_ID, 'GET'), function(response) {
		response.setEncoding('utf8');
		response.on('data', function(chunk) {
			var app = JSON.parse(chunk);

			console.log('Response: ' + chunk);
			if (app.customData.files)
				app.customData.fileList = app.customData.files.split(',').filter(function(el) {return el.length != 0});
			if (app.customData.images)
				app.customData.imageList = app.customData.images.split(',').filter(function(el) {return el.length != 0});

			console.log(encodeURIComponent("{appId: " + app.appId + "}"));
			var get = https.request(helper.getOptions("/stats/series/month/views?query=" + encodeURIComponent("{appId: '" + app.appId + "', developerId: '" + config.DEVELOPER_ID + "'}"), 'GET'), function(response) {
				response.setEncoding('utf8');
				response.on('data', function(chunk) {
					console.log('Response: ' + chunk);
					res.render('app/app-edit', {app: app, statistics: chunk});
				});
			});

			get.end();
		});
	});

	request.end();
});

module.exports = router;
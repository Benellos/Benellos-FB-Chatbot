var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var users = require('./app/routes/users');

var schedule = require('node-schedule');
var User = require('./app/model/user');
var apiController = require('./app/controller/api');

var index = require('./app/routes/index');
var webhook = require('./app/routes/webhook');


var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

mongoose.connect('mongodb://localhost/test');

var j = schedule.scheduleJob('0 9 * * *', function(){

    User.find({}, function(err, users) {
        if (users != null) {
          apiController.getArticles(function(err, articles) {
            users.forEach(function(user){
              apiController.sendArticleMessage(user.fb_id, articles[0])
            });
          })
        }
    });
});


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/webhook', webhook);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

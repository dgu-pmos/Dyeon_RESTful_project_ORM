var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
const expressSession = require('express-session');
const passport = require('passport');
const passportConfig = require('./module/passport/index');
const flash = require('connect-flash');
require('dotenv').config();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

passportConfig(passport);

// app.js에서 설정 관련 코드는 app.use route 위에다가 배치
app.use(expressSession({
  maxAge: 1000 * 60 * 60,
  secret : process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {secure: true}
}));
app.use(flash());
app.use(passport.initialize()); // passport 구동
app.use(passport.session()); // 세션 연결

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

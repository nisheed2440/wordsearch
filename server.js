var express = require('express');
var passport = require('passport');
var path = require('path');
var mongoose = require('mongoose');
var serverController = require('./server/controller.js');
var constants = require('./constants');
var GitHubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

//connect to mongodb
mongoose.connect(constants.mongodbUrl);

// Use the GithubStrategy within Passport.
passport.use(new GitHubStrategy({
    clientID: constants.githubClientId,
    clientSecret: constants.githubClientSecret,
    callbackURL: constants.passportCallbackUrl
  },
  function(accessToken, refreshToken, profile, cb) {
    var userJson = profile._json;
    serverController.pushUser({
      githubId: userJson.id,
      username: userJson.login,
      name: userJson.name,
      email: userJson.email,
      gravatar: userJson.avatar_url
    }, cb, profile);
  }));

// Use the GoogleStrategy within Passport.
passport.use(new GoogleStrategy({
    clientID: constants.googleClientId,
    clientSecret: constants.googleClientSecret,
    callbackURL: constants.googleCallbackUrl
  },
  function(accessToken, refreshToken, profile, cb) {
    var userJson = profile._json;
    console.log(userJson);
    serverController.pushUser({
      githubId: '',
      username: userJson.displayName.split(' ').join(''),
      name: userJson.displayName,
      email: userJson.emails[0].value,
      gravatar: userJson.image.url
    }, cb, profile);
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Create a new Express application.
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({
  extended: true
}));
app.use(require('express-session')({
  secret: 'keyboard cat',
  cookie: {
    maxAge: 86400000
  },
  resave: true,
  saveUninitialized: true
}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/desktop', function(req, res) {
  res.render('desktop', {});
});

app.get('/', serverController.checkForDesktop, function(req, res) {
  res.render('home', {
    user: req.user,
    words: serverController.wordlist
  });
});

app.get('/login', serverController.checkForDesktop, function(req, res) {
  res.render('login', {
    user: req.user
  });
});

app.get('/final', serverController.checkForDesktop, function(req, res) {
  res.render('final', {});
});

app.get('/login/github',
  passport.authenticate('github'));

app.get('/login/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

app.get('/login/github/return',
  passport.authenticate('github', {
    failureRedirect: '/'
  }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/login/google/return',
  passport.authenticate('google', {
    failureRedirect: '/'
  }),
  function(req, res) {
    res.redirect('/');
  });

//Server static build files
app.use(express.static('build'));
app.use('/assets',express.static('src/assets'));

app.get('/leaderboard', serverController.checkForDesktop, function(req, res) {
  res.render('leaderboard', {
    user: req.user
  });
});

//Ajax submit endpoint
app.post('/submit', function(req, res){
  //Add data to the object and push to db then send 200 ok
	var obj = {};
  console.log('req body: ' + JSON.stringify(req.body));
	res.send({});
});

app.listen(3000);
console.log("Application running on port 3000");
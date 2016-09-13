var express = require('express');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var path = require('path');
var mongoose = require('mongoose');
var serverController = require('./server/controller.js');
var constants = require('./constants');

//connect to mongodb
mongoose.connect(constants.mongodbUrl);

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
    gravatar: userJson.avatar_url,
    stats: {
        score: 0,
        lastPlayed: Date().now,
        submitted: Date().now
    }
  })
  return cb(null, profile);
}));

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
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', cookie: { maxAge: 86400 }, resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
function(req, res) {
  res.render('home', { user: req.user });
});

app.get('/login',
function(req, res) {
  res.render('login', { user: req.user });
});

app.get('/login/github',
passport.authenticate('github'));

app.get('/login/github/return',
passport.authenticate('github', { failureRedirect: '/' }),
function(req, res) {
  res.redirect('/');
});

// show the leaderboard
app.get('/leaderboard',function(req,res){
    serverController.showLeaderBoard(req, res);
});

//Server static build files
app.use(express.static('build'));

app.listen(3000);

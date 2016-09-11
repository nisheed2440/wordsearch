var express = require('express');
var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var path = require('path');
var mongoose = require('mongoose');
var serverController = require('./server/controller.js');

//connect to mongodb
mongoose.connect('mongodb://localhost:27017/test');

// Configure the github strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the github API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new GitHubStrategy({
  clientID: "e1b7f3ef0671cfb26588",
  clientSecret: "fcf94dfc0c3e07b49bd14759fa4fc90ea216f686",
  callbackURL: 'http://localhost:3000/login/github/return'
},
function(accessToken, refreshToken, profile, cb) {

  console.log(profile._json.email);
  serverController.pushUser({
    name: "Shafeeq",
    email: profile._json.email
  })
  // In this example, the user's github profile is supplied as the user
  // record.  In a production-quality application, the github profile should
  // be associated with a user record in the application's database, which
  // allows for account linking and authentication with other identity
  // providers.
  return cb(null, profile);
}));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Twitter profile is serialized
// and deserialized.
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
  // res.sendFile(path.join(__dirname , 'index.html'));
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

//Server static build files
app.use(express.static('build'));

app.get('/leaderboard',function(req,res){
  if(req.user){
    res.render('leaderboard', { user: req.user });
  }
  else{
    res.redirect('/login');
  }
})


app.listen(3000);

var AES = require('crypto-js/aes');
var SHA1 = require('crypto-js/sha1');
var MobileDetect = require('mobile-detect');
var mongoModel = require('./model.js');
var userModel = mongoModel.user;

var wordlist = [
  "react",
  "angular",
  "routing",
  "scope",
  "json",
  "ajax",
  "svg",
  "functional",
  "canvas",
  "cookies",
  "webpack",
  "node",
  "github",
  "backbone",
  "jquery",
  "gulp",
  "grunt",
  "javascript",
  "async",
  "defer",
  "promise",
  "callback",
  "immutable",
  "prototype",
  "closure",
  "console",
  "redux"
];

function cypher() {
  return SHA1('&copy;SapientNitro' + new Date().getFullYear()).toString();
}

function encrypt(word) {
  if (typeof word === 'string') {
    word = AES.encrypt(word, cypher()).toString();
  }
  return word;
}

function decrypt(word) {
    if (typeof word === 'string') {
        word = AES.decrypt(word, cypher()).toString(UTF8);
    }
    return word;
}

function encryptWordList() {
  var encryptedList = [cypher()];
  for (var i = 0; i < wordlist.length; i++) {
    encryptedList.push(encrypt(wordlist[i]));
  }
  return encryptedList;
}

function checkForDesktop(req, res, next) {
  // check to see if the caller is a mobile device
  var  md = new MobileDetect(req.headers['user-agent']);

  if (!md.mobile()) {
    console.log("Desktop Page");
    res.redirect('/desktop');
  } else {
    // if we didn't detect desktop, call the next method, which will eventually call the desktop route
    return next();
  }
}

module.exports.pushUser = function(req, cb, profile) {
  var user = new userModel({
    name: req.name,
    email: req.email,
    username: req.username,
    gravatar: req.gravatar
  });

  userModel.find({
    name: req.name
  }, function(err, usersExist) {
    if (usersExist && usersExist.length) {
      console.log('Name exists already');
      return cb(null, profile);
    } else {
      user.save(function(err, result) {
        console.log('User saved to db', result);
        return cb(null, profile);
      });
    }
  });
};

module.exports.cypher = cypher;
module.exports.encrypt = encrypt;
module.exports.wordlist = encryptWordList();
module.exports.checkForDesktop = checkForDesktop;
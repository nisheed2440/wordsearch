var AES = require('crypto-js/aes');
var SHA1 = require('crypto-js/sha1');
var UTF8 = require('crypto-js/enc-utf8');
var MobileDetect = require('mobile-detect');
var mongoModel = require('./model.js');
var constants = require('../constants');
var moment = require('moment');
var userModel = mongoModel.user;
var scoreModel = mongoModel.score;

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

function simpleCypher() {
    return SHA1('&copy;SapientNitro' + new Date().getFullYear()).toString();
}

function cypher(ts) {
    if (ts) {
        return AES.encrypt(ts, simpleCypher()).toString();
    }
    return simpleCypher();
}

function encrypt(word, cypherText) {
    if (typeof word === 'string') {
        return word = cypherText ? AES.encrypt(word, cypherText).toString() : AES.encrypt(word, cypher()).toString();
    }
    return null;
}

function decrypt(word, cypherText) {
    console.log(word,simpleCypher());
    if (typeof word === 'string') {
        return word = cypherText ? AES.decrypt(word, cypherText).toString(UTF8) : AES.decrypt(word, cypher()).toString(UTF8);
    }
    return null;
}

function encryptWordList(ts) {
    var key = cypher(ts);
    var encryptedList = [key];
    for (var i = 0; i < wordlist.length; i++) {
        encryptedList.push(encrypt(wordlist[i], key));
    }
    return encryptedList;
}

function checkForDesktop(req, res, next) {
    // check to see if the caller is a mobile device
    var md = new MobileDetect(req.headers['user-agent']);

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

module.exports.showLeaderBoard = function(req, res) {
    scoreModel.aggregate([
        /*{
            $match: {
                score: { $gte: constants.minScore }
            }
        },*/
        {
            $project: {
                username: '$username',
                score: '$score',
                duration: '$duration'
                    // {
                    //     $subtract: [
                    //         '$submitted',
                    //         '$started'
                    //     ]
                    // }
            }
        }, {
            $sort: {
                score: -1,
                duration: 1
            }
        }, {
            $group: {
                _id: '$username',
                stats: {
                    $first: {
                        score: '$score',
                        duration: '$duration'
                    }
                }
            }
        }, {
            $sort: {
                'stats.score': -1,
                'stats.duration': 1
            }
        }
        /*,
                {
            		$lookup: {
            			from: 'users',
            			localField: '_id',
            			foreignField: 'username',
            			as: 'info'

            		}
            	}*/
    ], function(err, docs) {
        if (err) {
            console.log(err);
        } else {
            console.log(docs);
            var leaders = docs.map(function(doc, index) {
                var t = moment.duration(doc.stats.duration, '');
                var ret = {
                        name: doc._id,
                        score: doc.stats.score.toFixed(2) + '%',
                        duration: moment.utc(doc.stats.duration).format("HH:mm:ss")
                    }
                    /*if(doc.info.length) {
                        ret['name'] = doc.info[0].name || doc.info[0].username;
                        //ret['username'] = doc.info[0].username;
                        ret['gravatar'] = doc.info[0].gravatar;
                    } else {
                        ret['name'] = '';
                        ret['username'] = '';
                        ret['gravatar'] = '';
                    }*/
                return ret;
            });
            console.log(leaders);
            res.render('leaderboard', {
                users: leaders
            });
        }
    });
};

module.exports.submitScore = function(req, res) {
    var scoreVal = (req.wS && req.wA) ? (req.wS * 100) / (req.wA) : 0;
    var startTime = moment(req.sT);
    var endTime = moment(req.eT);
    if (endTime.diff(startTime, 'seconds') > 30) {
        var score = new scoreModel({
            username: req.user,
            wordsAvailable: req.wA,
            wordsSolved: req.wS,
            //If people score 0 then they tried to hack
            score: scoreVal > 100 ? 0 : scoreVal,
            duration: endTime.diff(startTime, 'milliseconds')
        });
        score.save(function(err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log('Score saved to db', result);
            }
        });
    }
};
module.exports.simpleCypher = simpleCypher;
module.exports.cypher = cypher;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
module.exports.getEncWordlist = encryptWordList;
module.exports.checkForDesktop = checkForDesktop;
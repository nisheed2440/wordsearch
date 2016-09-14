var mongoModel = require('./model.js');
var constants = require('../constants');
var userModel = mongoModel.user;
var scoreModel = mongoModel.score;

module.exports.pushUser = function(req, res){
  var user = new userModel({
    name: req.name,
    email: req.email,
    username: req.username,
    gravatar: req.gravatar,
    scores: []
  });
  userModel.find({name : req.name}, function (err, usersExist) {
        if (usersExist.length){
            console.log('Name exists already');
        } else {
          user.save(function(err,result){
            console.log('User saved to db', result);
          });
        }
    });
};

module.exports.submitScore = function(req, res) {
    var newScore = new scoreModel({
        username: req.name,
        score: req.score,
        duration: req.duration,
        submitted: Date.now()
    });
    userModel.find({username: req.name}, function(err, userExist) {
        if(err) {
            console.log(err);
        } else {
            if(userExist.length) {
                console.log('Found user');
                newScore.save(function(err, result) {
                    res.redirect('/leaderboard');
                });
            } else {
                res.redirect('/noUser');
            }
        }
    });
};
module.exports.showLeaderBoard = function(req, res) {
    //check records against midnight of the current day
    var today = new Date();
    today.setHours(0,0,0,0);
    scoreModel.aggregate([
        {
            $match: {
                score: { $gte: 15 }
            }
        },
        {
            $project: {
                username: '$username',
                score: '$score',
                duration: {
                    $subtract: [
                        '$submitted',
                        '$started'
                    ]
                }
            }
        },
        {
            $sort: {
                score: -1,
                duration: 1
            }
        },
        {
            $group: {
                _id: '$username',
                stats: {
                    $first: {
                        score: '$score',
                        duration: '$duration'
                    }
                }
            }
        },
        {
            $sort: {
                'stats.score': -1,
                'stats.duration': 1
            }
        },
        {
    		$lookup: {
    			from: 'users',
    			localField: '_id',
    			foreignField: 'username',
    			as: 'info'

    		}
    	}
    ], function(err, docs) {
        if (err) {
            console.log(err);
        } else {
            var leaders = docs.map(function(doc, index){
                var ret = {
                    score: doc.stats.score,
                    duration: doc.stats.duration
                }
                if(doc.info.length) {
                    ret['name'] = doc.info[0].name;
                    ret['username'] = doc.info[0].username;
                    ret['gravatar'] = doc.info[0].gravatar;
                } else {
                    ret['name'] = '';
                    ret['username'] = '';
                    ret['gravatar'] = '';
                }
                return ret;
            });
            res.render('leaderboard', {users: leaders});
        }
    });
}

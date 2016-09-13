var mongoModel = require('./model.js');
var userModel = mongoModel.user;

module.exports.pushUser = function(req, res){
  var user = new userModel({
    name: req.name,
    email: req.email,
    username: req.username,
    gravatar: req.gravatar
  });
  userModel.find({name : req.name}, function (err, usersExist) {
        if (usersExist.length){
            console.log('Name exists already');
        }else{
          user.save(function(err,result){
            console.log('User saved to db', result);
          });
        }
    });
};

//
module.exports.showLeaderBoard = function(req, res) {
    userModel.find({
        stats: { score }
    }, function(err, docs) {
        res.render('leaderboard', { users: docs });
    });
}

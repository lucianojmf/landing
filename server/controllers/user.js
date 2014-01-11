var _ =           require('underscore')
    , User =      require('../models/User.js').User
    , UserProfile =      require('../models/UserProfile.js').UserProfile
    , userRoles = require('../../client/js/routingConfig').userRoles;

module.exports = {
    index: function(req, res) {
        User.findAll(function(err, users){
            if(err)
                res.json('');
            else{
                _.each(users, function(user) {
                    delete user.password;
                    delete user.twitter;
                    delete user.facebook;
                    delete user.google;
                    delete user.linkedin;
                });

                res.json(users);
            }
        });
    },
    myprofile: function(req, res){
        var user = req.user;
        user.getProfile(function(err, profile){
            if(err)
                return res.send(400, err);
            res.json(profile);
        });
    },
    myprofileEdit: function(req, res){
        var profileUpdate =  req.body;

        UserProfile.findById(profileUpdate._id, function(err, myprofile){
            if(err)
                return res.send(400, err);

            myprofile.name = profileUpdate.name;
            myprofile.birthday = profileUpdate.birthday;
            myprofile.gender = profileUpdate.gender;
            myprofile.address.city = profileUpdate.address.city;
            myprofile.address.state = profileUpdate.address.state;

            myprofile.save();

            res.json(myprofile);
        });
    }
};
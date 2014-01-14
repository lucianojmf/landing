var _ =           require('underscore')
    , User =      require('../models/User.js').User
    , UserProfile =      require('../models/UserProfile.js').UserProfile
    , userRoles = require('../../client/js/routingConfig').userRoles;

module.exports = {
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

        var dateSplitted = profileUpdate.birthday.split(".");

        UserProfile.findById(profileUpdate._id, function(err, myprofile){
            if(err)
                return res.send(400, err);

            myprofile.name = profileUpdate.name;
            if(dateSplitted){
                myprofile.birthday = new Date(parseInt(dateSplitted[2]), parseInt(dateSplitted[1])-1, parseInt(dateSplitted[0]));
            }
            
            myprofile.gender = profileUpdate.gender;
            myprofile.address.city = profileUpdate.address.city;
            myprofile.address.state = profileUpdate.address.state;

            myprofile.pets = profileUpdate.pets;
            myprofile.petikets = profileUpdate.petikets;
            myprofile.step1 = profileUpdate.step1;
            myprofile.step2 = profileUpdate.step2;
            myprofile.step3 = profileUpdate.step3;


            myprofile.save();

            res.json(myprofile);
        });
    }
};
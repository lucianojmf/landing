var _ =           require('underscore')
    , User =      require('../models/User.js')
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
    }
};
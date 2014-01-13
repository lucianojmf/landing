var 
    passport =        require('passport')
    , LocalStrategy =   require('passport-local').Strategy
    , TwitterStrategy = require('passport-twitter').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy
    , GoogleStrategy = require('passport-google').Strategy
    , LinkedInStrategy = require('passport-linkedin').Strategy
    , check =           require('validator').check
    , crypto = require('crypto')
    , mongoose = require('mongoose')
    , UserProfile = require('../models/UserProfile.js')
    , userRoles =       require('../../client/js/routingConfig').userRoles
    , Schema = mongoose.Schema;



var UserSchema = new mongoose.Schema({
    createdAt : { type: Date, default: Date.now },
    username: { type: String,  required: true,  index: { unique: true }},
    password: { type: String },
    provider: { type: String },
    providerId: {type: String},
    role:   {
        bitMask: {type: Number},
        title: {type:String}
    },
    profile: {type : Schema.ObjectId, index: { unique: true }}
    
});

// Método getProfile
UserSchema.methods.getProfile = function(callback){
    //Se for usuário recupera perfil de usuario
    if(this.role.bitMask === userRoles.user.bitMask)
        return this.db.model('UserProfile').findOne({user: this}, callback);
    if(this.role.bitMask === userRoles.business.bitMask)
        return this.db.model('BusinessProfile').findOne({user: this}, callback);
};

mongoose.model('User', UserSchema);


module.exports = {
    User: mongoose.model('User'),

    addUser: function(username, password, role, callback) {
        var shaSum = crypto.createHash('sha256');
        shaSum.update(password);

        var user = new module.exports.User({
            username: username,
            password: shaSum.digest('hex'),
            role: role
        });
        user.save(function(err){
            if(err)
              return callback("UserAlreadyExists");
            else{
                //cria perfil do novo usuário
                UserProfile.addProfile(user, function(err, profile){
                    if(err)
                        console.log('error creating profile ' + err);
                    user.profile = profile;
                    user.save(function(err){
                        if(err)
                            return callback("errorProfile");

                        callback(null, user);
                    });

                });
            }
        });
    },

    findOrCreateOauthUser: function(id, provider, profile, callback) {
        module.exports.User.findOne({providerId: id}, function(err, doc){
            if(err){
                callback(err, false);
            }else if(doc){
                callback(false, doc);
            }else{
                var now = new Date().toISOString();
                var user = new module.exports.User({
                    username: provider +'_'+ now,
                    role: userRoles.user,
                    providerId: id,
                    provider: provider
                });

                user.save(function(err){
                    if(err)
                        callback(err, false);
                    else{
                        //cria perfil do novo usuário
                        UserProfile.addProfileSocial(profile, user, function(err, profile){
                            if(err)
                                console.log('error creating profile social ' + err);

                            user.profile = profile;
                            user.save(function(err){
                                if(err)
                                    callback(err, false);


                                callback(false, user);
                            });
                        });
                    }
                });
            }
        });
    },

    validate: function(user) {
        check(user.username, 'Username must be an Email').isEmail();
    },

    localStrategy: new LocalStrategy(
        function(username, password, done) {
            var shaSum = crypto.createHash('sha256');
            shaSum.update(password);
            module.exports.User.findOne({username: username, password: shaSum.digest('hex')}, function(err, doc){
                if(err){
                    done(null, false, {message: 'Error on search.'})
                }
                if(doc){
                    return done(null, doc);
                }else{
                    return done(null, false, { message: 'Incorrect username.' });
                }

            });

        }
    ),

    twitterStrategy: function() {
        if(!process.env.TWITTER_CONSUMER_KEY)    throw new Error('A Twitter Consumer Key is required if you want to enable login via Twitter.');
        if(!process.env.TWITTER_CONSUMER_SECRET) throw new Error('A Twitter Consumer Secret is required if you want to enable login via Twitter.');

        return new TwitterStrategy({
            consumerKey: process.env.TWITTER_CONSUMER_KEY,
            consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
            callbackURL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:8000/auth/twitter/callback'
        },
        function(token, tokenSecret, profile, done) {
            module.exports.findOrCreateOauthUser(profile.id, profile.provider, profile, function(err, user){
                if(err)
                    done(err, null);

                done(null, user);
            });
        });
    },

    facebookStrategy: function() {
        if(!process.env.FACEBOOK_APP_ID)     throw new Error('A Facebook App ID is required if you want to enable login via Facebook.');
        if(!process.env.FACEBOOK_APP_SECRET) throw new Error('A Facebook App Secret is required if you want to enable login via Facebook.');

        return new FacebookStrategy({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL || "http://localhost:8000/auth/facebook/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            var user = module.exports.findOrCreateOauthUser(profile.id, profile.provider, profile, function(err, user){
                if(err)
                    done(err, null);

                done(null, user);
            });
        });
    },

    googleStrategy: function() {

        return new GoogleStrategy({
            returnURL: process.env.GOOGLE_RETURN_URL || "http://localhost:8000/auth/google/return",
            realm: process.env.GOOGLE_REALM || "http://localhost:8000/"
        },
        function(identifier, profile, done) {
            module.exports.findOrCreateOauthUser(identifier, 'google', profile, function(err, user){
                if(err)
                    done(err, null);

                done(null, user);
            });
        });
    },

    linkedInStrategy: function() {
        if(!process.env.LINKED_IN_KEY)     throw new Error('A LinkedIn App Key is required if you want to enable login via LinkedIn.');
        if(!process.env.LINKED_IN_SECRET) throw new Error('A LinkedIn App Secret is required if you want to enable login via LinkedIn.');

        return new LinkedInStrategy({
            consumerKey: process.env.LINKED_IN_KEY,
            consumerSecret: process.env.LINKED_IN_SECRET,
            callbackURL: process.env.LINKED_IN_CALLBACK_URL || "http://localhost:8000/auth/linkedin/callback"
          },
           function(token, tokenSecret, profile, done) {
            module.exports.findOrCreateOauthUser(provider, 'linkedin', profile, function(err, user){
                if(err)
                    done(err, null)

                done(null, user);
            });
          }
        );
    },
    serializeUser: function(user, done) {
        done(null, user.id);
    },

    deserializeUser: function(id, done) {
        module.exports.User.findById(id, function(err, user){
            if(err){
                console.log('error deserializer user ' + err);
                done(null, false);      
            }else if(user){
                done(null, user);
            }else{
                done(null, false); 
            }
        });

    }
};

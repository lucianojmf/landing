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
    , userRoles =       require('../../client/js/routingConfig').userRoles;



// Modelo de conta --------------------------------------------------
var UserSchema = new mongoose.Schema({
    createdAt : { type: Date, default: Date.now },
    username: { type: String,  required: true,  index: { unique: true }},
    password: { type: String },
    providerId: { type: String}, // para redes sociais Oauth
    
    role:   {
        bitMask: {type: Number},
        title: {type:String}
    },

    name: {
        first: { type: String,  index: { unique: false }},
        last: { type: String,  index: { unique: false }}
    }
    
    // birthday: {
    //     day: {type: Number, min:1, max:31, required: false},
    //     month: {type: Number, min:1, max:12, required: false},
    //     year: {type: Number}
    // },
    //photoUrl: { type: String},
    //biography: { type: String},
});
var User = mongoose.model('User', UserSchema);

module.exports = {
    addUser: function(username, password, role, callback) {
        var shaSum = crypto.createHash('sha256');
        shaSum.update(password);
        var user = new User({
            username: username,
            password: shaSum.digest('hex'),
            role: {bitMask:role.bitMask, title: role.title}
        });
        user.save(function(err){
            if(err)
                callback("UserAlreadyExists");

            callback(null, user);
        });
    },

    findOrCreateOauthUser: function(provider, providerId, firtsName, lastName, callback) {
        User.findOne({provider: providerId}, function(err, doc){
            if(err){
                console.log(err);
                return false;
            }else if(doc){
                console.log(doc);
                return false;
            }else{
                var user = new User({
                    username: provider + '_user',
                    name: {first: firtsName, last: lastName},
                    role: userRoles.user,
                    provider: providerId
                });

                user.save(function(err){
                    if(err)
                        console.log(err)

                    callback(null, user);

                });
                return user;
            }
        });
    },

    findAll: function(callback) {
        User.find({}, function(err, users){
            if(err){
                callback(err, null);
            }
            else{
                callback(null, users);
            }
        });
    },

    findById: function(id) {
        User.findOne({_id: id}, function(err, user){
            if(err)
                console.log(err);
            else
                return user;
        });
    },

    findByUsername: function(username) {
        User.findOne({username: username}, function(err, user){
            if(err)
                console.log(err);
            else
                return user;
        });
    },

    validate: function(user) {
        check(user.username, 'Username must be an Email and must be 1-20 characters long').len(6, 100).isEmail();
    },

    localStrategy: new LocalStrategy(
        function(username, password, done) {
            var shaSum = crypto.createHash('sha256');
            shaSum.update(password);
            User.findOne({username: username, password: shaSum.digest('hex')}, function(err, doc){
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
            var user = module.exports.findOrCreateOauthUser(profile.provider, profile.id);
            done(null, user);
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
            var user = module.exports.findOrCreateOauthUser(profile.provider, profile.id);
            done(null, user);
        });
    },

    googleStrategy: function() {

        return new GoogleStrategy({
            returnURL: process.env.GOOGLE_RETURN_URL || "http://localhost:8000/auth/google/return",
            realm: process.env.GOOGLE_REALM || "http://localhost:8000/"
        },
        function(identifier, profile, done) {
            var user = module.exports.findOrCreateOauthUser('google', identifier);
            done(null, user);
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
            var user = module.exports.findOrCreateOauthUser('linkedin', profile.id);
            done(null,user); 
          }
        );
    },
    serializeUser: function(user, done) {
        done(null, user.id);
    },

    deserializeUser: function(id, done) {
        var user = module.exports.findById(id);

        if(user)    { done(null, user); }
        else        { done(null, false); }
    }
};
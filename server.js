var express =       require('express')
    , http =        require('http')
    , passport =    require('passport')
    , path =        require('path')
    , User =        require('./server/models/User.js');

var app = module.exports = express();

// Import the data layer
var mongoose = require('mongoose');
var dbPath = process.env.MONGOHQ_URL || 'mongodb://localhost/petiko';

var models = {
	User: require('./server/models/User.js')

};

app.set('views', __dirname + '/client/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'))
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.cookieSession(
    {
        secret: process.env.COOKIE_SECRET || "Superdupersecret"
    }));

app.configure('development', 'production', function() {
    //app.use(express.csrf());

    mongoose.connect(dbPath, function onMongooseError(err) {
		if (err) throw err;
	});
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(models.User.localStrategy);
//passport.use(models.User.twitterStrategy());  // Comment out this line if you don't want to enable login via Twitter
//passport.use(models.User.facebookStrategy()); // Comment out this line if you don't want to enable login via Facebook
//passport.use(models.User.googleStrategy());   // Comment out this line if you don't want to enable login via Google
//passport.use(models.User.linkedInStrategy()); // Comment out this line if you don't want to enable login via LinkedIn

passport.serializeUser(models.User.serializeUser);
passport.deserializeUser(models.User.deserializeUser);

require('./server/routes.js')(app);

app.set('port', process.env.PORT || 8000);
http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
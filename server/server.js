var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var Strategy = require('passport-github').Strategy;
var GITHUB_CLIENT_ID = process.env.BOCKS_CLIENT_ID || 'oops';
var GITHUB_CLIENT_SECRET = process.env.BOCKS_CLIENT_SECRET || 'oops';
var port = process.env.PORT || 1337;

var app = express();
mongoose.connect('mongodb://localhost/bocks');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/../public'));

var hour = 3600000;
var cookieMaxAge = new Date(Date.now() + hour);
app.use(session({
    secret: process.env.BOCKS_SESSION_SECRET,
    cookie: { maxAge: cookieMaxAge },
    resave: false,
    saveUninitialized: true,
    store: new (require('express-sessions'))({
        storage: 'mongodb',
        instance: mongoose, // optional 
        host: 'localhost', // optional 
        port: 27017, // optional 
        db: 'bocks', // optional 
        collection: 'sessions', // optional 
        // expire: 86400 // optional 
    })
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new Strategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: 'http://127.0.0.1:' + (process.env.PORT || 1337) + '/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    // User.findOrCreate({ githubId: profile.id }, function (err, user) {
    //   return cb(err, user);
    // });
    console.log('Hey I logged in', accessToken, refreshToken, profile, cb);
    return cb(null, profile);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// app.post('/', function (req, res) {
// });
// app.get('/', function (req, res) {
//   // res.send('hello world');
// });
// app.delete('/', function (req, res) {
// });

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/oops' }),
  function(req, res) {
    console.log('Github token: ', req.query.code);
    console.log('Github Username: ', req.user);
    // Successful authentication, redirect home.
    console.log('in authentication callback, redirecting to home page');
    res.redirect('/');
});

app.listen(port, function() {
  console.log('listening on ', port);
});
//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');
require("dotenv").load();
var async = require('async');
var express = require('express');
var exphbs  = require('express-handlebars');
var ObjectId = require('mongodb').ObjectID;

var app = express();
var server = http.createServer(app);

var mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
var passport = require('passport');
var session = require('express-session');

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.bodyParser());

//USE HANDLEBARS AS VIEW ENGINE
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var User = require("./app/models/user");

require('./config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

app.use(session({ secret: 'bigboy' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
//routes
//AUTHENTICATION ROUTES

app.get("/auth/facebook", passport.authenticate("facebook", {scope: "email"}));

app.get("/auth/facebook/callback", passport.authenticate('facebook' , {
  successRedirect : '/app/home',
  failureRedirect : '/app'
}));

app.get("/auth/google", passport.authenticate("google", {scope: ["profile", "email"]}));

app.get("/auth/google/callback", passport.authenticate('google' , {
  successRedirect : '/app/home',
  failureRedirect : '/app'
}));

  //authorization routes
  
app.get("/connect/facebook", passport.authorize("facebook", {scope: "email"}));

app.get("/connect/facebook/callback", passport.authorize('facebook' , {
  successRedirect : '/app/home',
  failureRedirect : '/app'
}));

app.get("/connect/google", passport.authorize("google", {scope: ["profile", "email"]}));

app.get("/connect/google/callback", passport.authorize('google' , {
  successRedirect : '/app/home',
  failureRedirect : '/app'
}));

  //log-out
  
app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

//ACTUAL SITE
app.get("/", function(req, res){
  res.render("index");
  //res.sendfile(__dirname + "/public/index.html");
});

app.get("/app", function(req, res){
  if(req.isAuthenticated()){
    res.redirect("/app/home");
  }
  else{
    res.redirect("/");
  }
});

app.get("/app/login", function(req,res){
  res.render("login");
  //res.sendfile(__dirname + "/public/login.html");
});

app.get("/app/register", function(req, res){
  res.render("register");
  //res.sendfile(__dirname + "/public/register.html");
});

app.get("/app/home", function(req, res){
  if(req.isAuthenticated()){
    res.render("home", {
      user: req.user.facebook || req.user.google,
      pic: req.user.facebook.picture || req.user.google.picture || "/images/profile.png"
    });
    //res.sendfile(__dirname + "/public/home.html");
  }
  else{
    res.redirect("/app");
  }
});

//API

app.post("/api/set", function(req,res){
    //console.log(req.user._id)
    //console.log(req.body["a[]"]);
    //User.findOne({_id: req.user._id}, function(err, user){
      //if(err){console.log("SHIT")};
      //console.log(user);
    //})
    User.findOneAndUpdate({_id: req.user._id}, {"data": req.body["a[]"]}, function(err, user){
      console.log(user);
    });
});

app.get("/api/get", function(req, res){
  User.findOne({ _id: req.user._id }).exec(function(err, user){
    if(err){console.log("error");}
    else{
      res.send(user.data);
    }
  });
});

app.use(express.static(path.resolve(__dirname, 'assets')));

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Server listening at", addr.address + ":" + addr.port);
});

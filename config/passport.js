var passport = require("passport");

var User = require("../app/models/user");

var facebookStrategy = require("passport-facebook");
var googleStrategy = require("passport-google-oauth").OAuth2Strategy;

require("dotenv").load();

module.exports = function(passport){
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
    passport.use(new facebookStrategy({
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: process.env.APP_URL + "auth/facebook/callback",
      profileFields : ["id","displayName","email", "picture.type(large)"],
      passReqToCallback: true
    }, function(req, token, tokenSecret, profile, done){
        
        process.nextTick(function(){
           if(!req.user){
               User.findOne({"facebook.id": profile.id}, function(err, user){
              
              if(err){return done(err)}
              
              if(user){return done(null, user);}
              else{
                    var newUser = new User();
                    //set data
                    
                    newUser.facebook.id    = profile.id; // set the users facebook id                   
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                    newUser.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.facebook.email = profile.emails[0].value;
                    newUser.facebook.picture = profile.photos ? profile.photos[0].value : '/img/faces/unknown-user-pic.jpg';
                    newUser.data = [];
                    
                    newUser.save(function(err){
                        if(err){throw err}
                        return done(null, newUser);
                    });
                    
              }
               
                });
           }
           else{
               var user = req.user;
               
                user.facebook.id    = profile.id; // set the users facebook id                   
                user.facebook.token = token; // we will save the token that facebook provides to the user                    
                user.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
                user.facebook.email = profile.emails[0].value;
                user.facebook.picture = profile.photos ? profile.photos[0].value : '/img/faces/unknown-user-pic.jpg';
                
                user.save(function(err){
                    if(err){throw err;}
                    return done(null, user);
                });
           }
           
            
        });
        
        
        
    }));
    
    passport.use(new googleStrategy({
      clientID: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      callbackURL: process.env.APP_URL + "auth/google/callback",
      passReqToCallback: true
    }, function(req, token, tokenSecret, profile, done){
        
        process.nextTick(function(){
           
           if(!req.user){
              User.findOne({"google.id": profile.id}, function(err, user){
              
              if(err){return done(err)}
              
              if(user){return done(null, user);}
              else{
                    var newUser = new User();
                    //set data
                    
                    newUser.google.id    = profile.id; // set the users facebook id                   
                    newUser.google.token = token; // we will save the token that facebook provides to the user                    
                    newUser.google.name  = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.google.email = profile.emails[0].value;
                    newUser.google.picture = profile.photos[0].value;;
                    console.log("PICTURE:"+ profile._json['picture']);
                    newUser.data = [];
                    
                    newUser.save(function(err){
                        if(err){throw err}
                        return done(null, newUser);
                    });
                    
              }
               
                }); 
           }
           
           else{
               var user = req.user;
               
                user.google.id    = profile.id; // set the users facebook id                   
                user.google.token = token; // we will save the token that facebook provides to the user                    
                user.google.name  = profile.displayName; // look at the passport user profile to see how names are returned
                user.google.email = profile.emails[0].value;
                user.google.picture = profile._json['picture'];
                user.save(function(err){
                    if(err){throw err;}
                    return done(null, user);
                });

           }
           
            
        });
        
        
        
    }));
    
    
    
}
//jshint esversion:6
// leve 4 using hashing and salting

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();

const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}))
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const mongoDB = 'mongodb://localhost:27017/userDB';
// mongoose.set("useCreateIndex",true);
const userSchema = new mongoose.Schema ({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose
    .connect(mongoDB)
    .then(()=>{
        console.log('MongoDB is connected');
        app.post("/register",function(req,res){
            User.register({username:req.body.username}, req.body.password)
            .then(()=>{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets");
                })
            })
            .catch((err)=>{
                console.log(err);
                res.redirect("/register");
            })
        });
        
        app.post("/login", function(req, res) {
            const user = new User({
                username: req.body.username,
                password: req.body.password
            });
            req.login(user, function(err){
                if(err){
                    console.log(err);
                }
                else{
                    passport.authenticate("local")(req,res,function(){
                        res.redirect("/secrets");
                    })
                }
            });
        });
    })
    .catch((err)=>{
        console.log('unable to connect to the server:',err);
    });

    app.get("/",function(req,res){
        res.render("home")
    });
    app.get("/register",function(req,res){
        res.render("register" );
    });
    
    app.get("/login",function(req,res){
        res.render("login");
    });

    app.get("/secrets",function(req,res){
        if(req.isAuthenticated()){
            res.render("secrets");
        }
        else{
            res.redirect("/login");
        }
    });
    app.get("/logout", function(req, res) {
        req.logout(function(err) {
            if (err) {
                console.error(err); // Handle error appropriately
            }
            res.redirect("/");
        });
    });
    app.listen(3000,function(){
        console.log("Server stated on port 3000");
    });
    
    




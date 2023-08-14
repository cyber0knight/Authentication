//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();

console.log(process.env.API_KEY);

const mongoose = require('mongoose');
const md5 = require("md5");
const mongoDB = 'mongodb://localhost:27017/userDB';


app.use(express.static("public"));
app.set('view engine','ejs');

app.use(bodyParser.urlencoded({
    extended:true
}))

const userSchema = new mongoose.Schema ({
    email:String,
    password:String
});


const User = new mongoose.model("User", userSchema);

mongoose
    .connect(mongoDB)
    .then(()=>{
        console.log('MongoDB is connected');
        app.post("/register",function(req,res){
            const newUser = new User({
                email : req.body.username,
                password : md5(req.body.password)
            });
            newUser.save()
                .then(()=>{
                    console.log('data added to the database');
                    res.render("secrets");
                })
                .catch((err)=>{
                    console.log(`unable to add: ${err}`);
                });
        });
        
        app.post("/login", function(req, res) {
            const username = req.body.username;
            const password = md5(req.body.password);
            console.log(req.body);
            console.log("yes");
        
            User.findOne({ email: username })
                .then(function(foundUser) {
                    if (foundUser) {
                        if (foundUser.password === password) {
                            res.render("secrets");
                        } 
                        else {
                            // Incorrect password
                            res.send("Incorrect password"+foundUser.password + password);
                        }
                    } 
                    else {
                        // User not found
                        res.send("User not found");
                    }
                })
                .catch(function(err) {
                    console.log(err);
                });
        });
                 
        app.get("/",function(req,res){
            res.render("home")
        });
        app.get("/register",function(req,res){
            res.render("register");
        });
        
        app.get("/login",function(req,res){
            res.render("login");
        });
    
        app.listen(3000,function(){
            console.log("Server stated on port 3000");
        });
    })
    .catch((err)=>{
        console.log('unable to connect to the server:',err);
    });
    
    




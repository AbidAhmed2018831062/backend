const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const bcrypt=require('bcrypt');
const express=require("express");
const createDatabase=require("./database");
const db=createDatabase();
passport.use(
  new GoogleStrategy(
    {
      clientID: "156219269424-keo08vi35okmci3g1k7k92nlokf89geg.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: "/auth/google/callback",
    },
   (accessToken, refreshToken, profile, done) => {
        // check if user already exists in our own db
        console.log(profile);
        console.log("Abid Ahmed");
        const sql="SELECT * FROM users WHERE email=?";
  db.query(sql,[email],async (err,result)=>{
      if(err===null&&result.length>0)
      {
        res.status(200).send(result);
        done(null, result);
      }
      else{
        const quert="INSERT INTO `googleusers` (`name`, `email`, `googleId`) VALUES (?,?,?);";
        db.query(quert,[req.body.name,req.body.email,req.body.googleId],(err,result)=>{
            if(err===null)
            res.status(200).send(result);
           done(null,result);
        });
      }
    
  })
    })
);


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
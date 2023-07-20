const createDatabase=require("../database");
const express=require("express");

const router=express.Router();
const db=createDatabase();
const passport = require("passport");

const CLIENT_URL = "http://localhost:5173/";

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "successfull",
      user: req.user,
      //   cookies: req.cookies
    });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(CLIENT_URL);
});

router.get("/google", passport.authenticate("google", { scope: ["openid","email","profile"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
   
    failureRedirect: "/login/failed",
  }),
  function(req, res) {
   console.log(req);
   const sql="SELECT * FROM users ORDER BY id DESC LIMIT 1";
      db.query(sql,(err,user)=>{
        res.redirect(CLIENT_URL+"?id="+user[0].id.toString());
      })
   
  });



module.exports = router
const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const bodyParser = require("body-parser");
const createDatabase=require("./database");
const passport=require("passport");
const { Configuration, OpenAIApi } = require("openai");
const db=createDatabase();

const configuration = new Configuration({
  apiKey: "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",
});
const app=express();
const openai = new OpenAIApi(configuration);
const chatgpt=require("./routes/chatgpt.js");
const user=require("./routes/UserProfile");
const auth=require("./routes/auth");
const admin=require("./routes/admin");
const document=require("./routes/documents");
const feedback=require("./routes/feedback");

app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());

app.use("/chatgpt",chatgpt);
app.use("/user",user);

app.use("/admin",admin);
app.use("/document",document);
app.use("/feedback",feedback)

app.get("/chat", async (_, res) => {
  const token = await client.generateSessionToken()

  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(token))
})

app.get("/",async(req,res)=>{
  res.send("I am Abid");
})
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
  db.query(sql,[profile.emails[0].value],async (err,result)=>{
      if(err===null&&result.length>0)
      {
        done(null, result);
      }
      else{
        const quert="INSERT INTO `users` (`name`, `email`, `googleId`) VALUES (?,?,?);";
        db.query(quert,[profile.displayName,profile.emails[0].value,profile.id],(err,result)=>{
            if(err===null)
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
app.use("/auth",auth);
const port=8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

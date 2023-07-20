const express=require("express");
const createDatabase=require("../database");
const route=express.Router();
const db=createDatabase();
const bcrypt=require('bcrypt');
var axios =require("axios");
route.get("/location",async(req,res)=>{
//     var ipapi = require('ipapi.co');
//     ipapi.location(callback)   
// var callback = function(loc){
//     console.log(loc);
//     res.send(loc);
//};

fetch('https://ipapi.co/json/')
.then(function(response) {
  response.json().then(jsonData => {
    console.log(jsonData);
  });
})
.catch(function(error) {
  console.log(error)
});
   
});
route.post("/createadmin",async (req,res)=>{
    const {name,email,password}=req.body;
     
       const hashedPassword = await bcrypt.hash(password,10);
       const quert="INSERT INTO `admin` (`email`, `password`) VALUES (?,?);";
       db.query(quert,[email,password],(err,result)=>{
           if(err===null){
         const sql="SELECT * FROM admin ORDER BY id DESC LIMIT 1";
         db.query(sql,(err,user)=>{
           res.send(user);
         })
           }
           else{
               let errors={};
           
            res.status(400).send(err);
           }
       });
   
      
   });
route.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    const sql="SELECT * FROM admin WHERE email=?";
    db.query(sql,[email],async (err,result)=>{
        if(err===null&&result.length>0)
        {
        
           const pass=result[0].password;
        
           if(pass===password){
               res.status(200).send({result:result[0]});
            }
           else
           res.status(401).send({what:"Email and password combination is not right"})
        }
        else
        res.status(401).send({what:"Username and password combination is not right"})
    })
   // const pass=bcrypt.compare()
  });

  route.put("/access",(req,res)=>{
    const {id}=req.body;
     const sql="UPDATE users set  `access`=?where id=?;";
     db.query(sql,["yes",req.body.id],(err,result)=>{
         if(err===null)
         {
             if(result.length===0)
             res.status(404).send({msg:"Report not found"}); 
             else{
            
             res.status(200).send({result:result});
             }
         }
         else{
             if(err.sqlMessage!==null)
             res.status(400).send(err.sqlMessage);
             else
             res.status(500).status("Internal Server Error");
         }
     })
    });
  
    route.put("/time",(req,res)=>{
        const {id}=req.body;
         const sql="UPDATE users set  `time`=?,`remtime`=?, `date`=? where id=?;";
         db.query(sql,[req.body.time,req.body.time,req.body.date,req.body.id],(err,result)=>{
             if(err===null)
             {
                 if(result.length===0){
                   
                 res.status(404).send({msg:"Report not found"}); 
                 }
                 else{
                
                 res.status(200).send({result:result});
                 }
             }
             else{
                 if(err.sqlMessage!==null)
                 res.status(400).send(err.sqlMessage);
                 else
                 res.status(500).status("Internal Server Error");
             }
         })
        });
    
        route.get("/users",(req,res)=>{
            const {id}=req.body;
             const sql="SELECT * FROM users";
             db.query(sql,(err,result)=>{
                 if(err===null)
                 {
                     if(result.length===0)
                     res.status(404).send({msg:"Report not found"}); 
                     else{
                       
                     res.status(200).send({result:result});
                     }
                 }
                 else{
                     if(err.sqlMessage!==null)
                     res.status(400).send(err.sqlMessage);
                     else
                     res.status(500).status("Internal Server Error");
                 }
             })
            });
  module.exports=route;
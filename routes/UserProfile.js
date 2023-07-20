const express=require("express");
const createDatabase=require("../database");
const route=express.Router();
const db=createDatabase();
const bcrypt=require('bcrypt');

route.post("/createuser",async (req,res)=>{
 const {name,email,password}=req.body;
  
    const hashedPassword = await bcrypt.hash(password,10);
    const quert="INSERT INTO `users` (`name`, `email`, `password`) VALUES (?,?,?);";
    db.query(quert,[name,email,hashedPassword],(err,result)=>{
        if(err===null){
      const sql="SELECT * FROM users ORDER BY id DESC LIMIT 1";
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
  const sql="SELECT * FROM users WHERE email=?";
  db.query(sql,[email],async (err,result)=>{
      if(err===null&&result.length>0)
      {
       
         const pass=result[0].password;
         const isRightPassword=await bcrypt.compare(password,pass);
         if(isRightPassword){
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
route.put("/deletetime",(req,res)=>{
  const {id}=req.body;
   const sql="UPDATE users set  `remtime`=? where id=?;";
   db.query(sql,[req.body.remtime,id],(err,result)=>{
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

  route.get("/getprofile",async(req,res)=>{
    const {id}=req.query;
    const sql="SELECT * FROM users WHERE id=?";
    db.query(sql,[id],async (err,result)=>{
        if(err===null&&result.length>0)
        {
        
               res.status(200).send({result:result[0]});
        }
        else
        res.status(401).send({what:"Username and password combination is not right"})
    })
   // const pass=bcrypt.compare()
  });
module.exports=route;
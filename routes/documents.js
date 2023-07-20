const express = require("express");
const fs = require('fs');
const createDatabase=require("../database");
const db=createDatabase();
const route=express.Router();
const htmlDocx= require('html-docx-js');
 


route.post("/createdocument",async (req,res)=>{
    const {content,userId,date}=req.body;
     
       const quert="INSERT INTO `documents` (`contents`, `userId`, `date`,`filename`) VALUES (?,?,?,?);";
       db.query(quert,[content,userId,date,req.body.forfile],(err,result)=>{
           if(err===null){
         const sql="SELECT * FROM documents ORDER BY id DESC LIMIT 1";
         db.query(sql,(err,document)=>{
            const topadd="<html><body>";
            const bottomadd="</html></body>";
            fs.writeFile(`D:/medworksmith/src/assets/uploads/${req.body.forfile}.html`, topadd+content+bottomadd, err => {
                if (err) {
                  console.error(err);
                }
                res.send(document);
              });
          
         })
           }
           else{
               let errors={};
            
            res.status(500).send(err);
         
           }
       });
   
      
   });

   route.get("/getdocument",async (req,res)=>{
    
     
       const quert="SELECT * from documents where id=?;";
       db.query(quert,[req.query.id],(err,result)=>{
           if(err===null){
        res.send(result);
           }
           else{
               let errors={};
              if(err.sqlMessage.includes("email"))
            errors.email="Email already exists";
              if(err.sqlMessage.includes("phone")){
              errors.phone="Phone number already exists";
              }
            if(!err.sqlMessage.includes("phone")&&!err.sqlMessage.includes("email"))
            res.status(500).send(err);
            else
            res.status(400).send(errors);
           }
       });
   
      
   });

   route.put("/updatedocument",(req,res)=>{
    const {id}=req.body;
     const sql="UPDATE documents set  `title`=?, `contents`=? where id=?;";
     db.query(sql,[req.body.title,req.body.content,req.body.id],(err,result)=>{
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

    route.get("/getdocuments",async(req,res)=>{
        const sql= "SELECT * FROM documents WHERE userId=?";
         db.query(sql,[req.query.id],(err,result)=>{
             if(err===null)
             {
                 if(result.length===0)
                 res.status(404).send({msg:"Document not found"}); 
                 else{
                 res.status(200).send({documents:result.reverse()});
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
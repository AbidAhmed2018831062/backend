const express = require("express");

const createDatabase=require("../database");
const db=createDatabase();
const route=express.Router();
const crawler = require('crawler-request');


const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

route.post("/gettext",async(req,res)=>{
   console.log(req.body.url);     
    crawler(req.body.url).then(function(response){
      console.log(response);
      if(response.status===403){
      res.status(400).send("The pdf file cannot be read! Sorry!!");
      return;
      }
      else{
      if(response.text){
        const { userMessages,response2 } = req.body;
      let prompt="Keep this content as data. I will ask question about this later\n\n"+"The title of the article is: "+req.body.pdfPaper.title+"\nPDF Link of the article is: "+"\nMain Body text is: "+response.text.substring(0,10000);
      const sent=[];
      response2.filter(e=>e.content!=="ef");
      console.log(userMessages);
      userMessages.forEach((e,i)=>{
         sent.push({role:"user",content:e});
         sent.push(response2[i]);
      });
      sent.push({role:"user",content:prompt})
      console.log(sent);
        openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: prompt}],
      }).then(chatCompletion=>{
        res.send(chatCompletion.data.choices[0].message);
      }).catch(err=>{
        res.status(400).send("An error happended");
      });
    }
    else
    res.status(404).send("PDF not found");
  }
    });
  
})
route.post("/chat", async (req, res) => {
    // Get the prompt from the request
   
    const { prompt,userMessages,response } = req.body;
    response.filter(e=>e.content!=="ef");
    const sent=[];
    console.log(userMessages);
    userMessages.forEach((e,i)=>{
       sent.push({role:"user",content:e});
       sent.push(response[i]);
    });
    sent.push({role:"user",content:prompt})
   console.log(sent);
    // Generate a response with ChatGPT
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: sent,
    });
  
    res.send(chatCompletion.data.choices[0].message);
  });
  route.post("/createdb", async (req, res) => {
  const {title,userMessages1,chatmessages,date}=req.body;
  const quert="INSERT INTO `medworksmith`.`chats` (`title`,`userMessages`, `chatmessages`, `date`) VALUES (?,?,?,?);";
  db.query(quert,[title,
      userMessages1,
      chatmessages,
      date,
  ],(err,result)=>{
      if(err===null)
      {
        const sele="SELECT * FROM `medworksmith`.`chats` order by id desc LIMIT 1";
        db.query(sele,(err,result1)=>{
            if(err===null)
            res.send(result1);
            else
            res.status(500).send(err);
        })
      }
      else{
       res.status(500).send(err);
      }
  });
});
route.put("/update",(req,res)=>{
  const {id}=req.body;
   const sql="UPDATE chats set  `title`=?, `userMessages`=?, `chatmessages`=?,`showchat`=? where id=?;";
   db.query(sql,[req.body.title,req.body.userMessages1,req.body.chatmessages,"yes",req.body.id],(err,result)=>{
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
  route.get("/getchats",async(req,res)=>{
    const sql= "SELECT * FROM chats where showchat=?";
     db.query(sql,["yes"],(err,result)=>{
         if(err===null)
         {
             if(result.length===0)
             res.status(404).send({msg:"No chats to show"}); 
             else{
             res.status(200).send({reports:result.reverse()});
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
route.get("/getchat",async(req,res)=>{
  const sql= "SELECT * FROM chats WHERE id=?";
   db.query(sql,[req.query.id],(err,result)=>{
       if(err===null)
       {
           if(result.length===0)
           res.status(404).send({msg:"User not found"}); 
           else{
           res.status(200).send({reports:result.reverse()});
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
// const fetch = require('node-fetch');

// app.post('/chat', async (req, res) => {
//   const { messages } = req.body;
//   const data = {
//     model: 'gpt-3.5-turbo',
//     stream: true,
//     messages: [
//       {
//         role: 'system',
//         content: 'You are a helpful assistant.',
//       }
//     ]
//   };

//   try {
//     const response = await fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         ...data,
//         messages: [
//           ...data.messages,
//           ...messages,
//         ]
//       })
//     });
//     app.post('/api/title', async (req, res) => {
//       try {
//         const { title } = req.body;
//         const response = await fetch('https://api.openai.com/v1/completions', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//           },
//           body: JSON.stringify({
//             model: 'text-davinci-002',
//             prompt: `Write a 3 words title for the following prompt: ${title}`,
//             max_tokens: 100,
//             temperature: 0.7,
//             n: 1,
//           })
//         })
    
//         const data = await response.json();
//         console.log(data, 'data');
//         res.status(200).json({ title: data?.choices?.[0]?.text });
//       } catch (error) {
//         console.log(error, 'error');
//       }
//     });
//     response.body.on('data', data => {
//       const lines = data.toString().split('\n').filter((line) => line.trim() !== '');
//       for (const line of lines) {
//         const message = line.replace(/^data: /, '');
//         if (message === '[DONE]') {
//           return res.end();
//         }
//         console.log(message);
//         const { choices } = JSON.parse(message);
//         const { content } = choices[0].delta || {};

//         if (content) {
//           res.write(content);
//         }

//       }
//     })
//   } catch (error) {
//     console.log(error, 'error');
//   }
// });

// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });
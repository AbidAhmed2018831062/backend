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


route.post("/getfeedback", async (req, res) => {

 let prompt="Use these text as a base to rate the article/journal/research paper:"+"\n\n Research papers and review considerations David Wetherall (CSE561, Spring 2002) The following are my answers; you are encouraged to formulate your own. There are also several well-respected and germane commentaries, such as the following: An Evaluation of the Ninth SOSP Submissions, or, How (and How Not) to Write a Good Systems Paper by Roy Levin and David D. Redell 1. What makes a good review? What is important about a review depends on the context, e.g., conference, journal or workshop. In the case of 561 you want to demonstrate that you excel at separating out the key ideas in the paper from incidentals, have a good understanding of how the ideas relate to broader context, and are able to constructively critique the research process. Roughly, I’m after around half a page (at most one page) with the following: • One or two sentence summary. This is your takeaways in your own words. • Key strengths of the paper. Again, where you think the value of the paper lies. • Key weaknesses of the paper. What would you do differently? • Any other points you want to make, e.g., follow-on directions, etc. Also, as an aside, you may be interested to read a recent, insider view of the SIGCOMM review and paper selection process: Improving Sigcomm: a few straw proposals. 2. What makes a good paper? Essentially, that you should learn something significant that you didn’t know (and wasn’t known) before. I tend to like papers that demonstrate interesting ideas or approaches even if they don’t pan out to significant results, because they stretch my thinking. But unproven ideas that are interesting but not significant are not a good way to get conference papers accepted! In addition to ideas and results, a good paper should highlight its good research by its writing. This is mostly about structure, not elegant sentences. It should clearly identify a well-defined problem being tackled and describe why anyone should care about the problem. It should say what it is doing that is new or different compared to other work in the area. It should be clear about its contributions and their limitations (without being negative). Any reader should be able to answer the above three questions quickly, after only a quick look at the paper, and mostly its beginning and end. Many papers (and most submissions) fail this test. The middle of the paper should build up a solid case that leads from the stated problem to the claimed contributions while avoiding pitfalls (see below). This relies on a foundation of good research. 3. What makes good research? This seems a very important question! Here are two very general considerations: • It tackles an important problem. If not then even a stellar result will be of little value. Important problems are usually those that most people will agree matter (are “real”) because if they are solved then something has changed. 2 of 2 • It produces a new and significant result, often by taking a fresh approach or looking at the problem in a different light. The result is significant if others benefit from it, the more the better. If a positive result, others may build on it directly. Or it may have opened a new research area. If a negative result, others may alter their research direction. Beyond this, research itself is mostly conducted by some combination of measurement, simulation, theory and systems work, each of which has different associated issues. Measurement. A key issue is validation: how to we know that a new technique produces a correct or meaningful answer or a dataset is representative? A well-designed methodology is your friend. Theory. A key issue is the exact form of problem studied and the assumptions it embodies. Strong theoretical results work in a framework that corresponds to important problems and don’t make unrealistic assumptions. To be of lasting value they must not be tied tightly to details that will change tomorrow, but rather speak for a class of solutions. Systems. A key issue for real systems is a comparative evaluation of how well it works. It is only useful to know that some component runs at X operations/sec if we understand both how this differs from other design alternatives and why the metric matters in terms of the problem in the first place. Simulation. A key issue is correctness! How do we know there is no bug in your simulator? You should run sanity checking experiments to which you presume you know the answer. There is also a tension between realism and generality – you must identify and include important factors in your setup and explore enough of the space to draw conclusions. Again, a well-designed methodology is your friend."+"\n\nThe Article"+req.body.article+"\n\n"+"Also rate the provided article/research paper/journal out of 10";

 const { userMessages,response } = req.body;
 const sent=[];
 response.filter(e=>e.content!=="ef");
 console.log(userMessages);
 userMessages.forEach((e,i)=>{
    sent.push({role:"user",content:e});
    sent.push(response[i]);
 });
 sent.push({role:"user",content:prompt})
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

  module.exports=route;

function createDatabase(){
    
    const {createPool}=require("mysql");
const pool=createPool({
    host:"localhost",
    user:"root",
    password:"",
    database:"medworksmith"
}
)
return pool;
}
module.exports=createDatabase;

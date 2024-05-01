const sqlite3 = require('sqlite3').verbose()
let db = new sqlite3.Database('./db/user.db');
let sql = 'INSERT INTO users (first,last,email,password) VALUES ("Laurence","Svekis","example@gmail.com","pass")';
db.run(sql,[],function(err){
if(err) {return console.log(err.message) }
    console.log(`Row ready ${this.lastID}`);
}) 
db.close();
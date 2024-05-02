const express = require('express');
const app = express();
const db = require('./db.js');
const port = 8080 || process.env.PORT;


const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// Include Express Validator Functions
const { check, validationResult } = require('express-validator');

app.use(express.static('public'))

app.get('/signup',function(req,res){
    res.sendFile(__dirname + '/public/signup.html')
})

app.get('/login',function(req,res){
    res.sendFile(__dirname + '/public/login.html')
})

app.get('/createPosts',function(req,res){
    res.sendFile(__dirname + '/createPosts.html')
})

app.get('/createBirds',function(req,res){
    res.sendFile(__dirname + '/createBirds.html')
})

app.get('/viewPosts',function(req,res){
    res.sendFile(__dirname + '/viewPost.html')
})

// Validation
var signupValidate = [
  // Check username
  check('username')
        .escape()
        .notEmpty()
        .withMessage('Username required')
        .isLength({min: 3,max:20})       
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[A-Za-z0-9]+$/),
  // Check Email
  check('email')
        .isEmail()
        .trim()
        .withMessage('Email Must Be an Email Address')
        .escape()
        .normalizeEmail(),
  // Check Password
  check('password')
        .isLength({ min: 8 })
        .withMessage('Password Must Be at Least 8 Characters')
        .matches('[0-9]')
        .withMessage('Password Must Contain a Number')
        .matches('[A-Z]')
        .withMessage('Password Must Contain an Uppercase Letter')
        .trim()
        .escape()];


app.post('/signup', signupValidate, function(req,res){

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  	return res.status(422).json({ errors: errors.array() });
  }
  else {
    console.log(req.body);
    let sql = 'INSERT INTO users(username,profile,email,password) VALUES (?,?,?,?)';
    db.run(sql,[req.body['username'],req.body['profile'],req.body['email'],req.body['password']],function(err,row){
     if(err){ throw err;}
    res.json({'id':this.lastID})
    })
  }
})


// Validation of Post Body
var postValidate = [check('body', 'Body should not have special characters.').escape()];

app.post('/addPost', postValidate,function(req,res){
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  	return res.status(422).json({ errors: errors.array() });
  }
  else {
    console.log(req.body);
    let sql = 'INSERT INTO posts(title, body, createdDate, author, birdID) VALUES (?,?,?,?,?)';
    db.run(sql,[req.body['title'], req.body['body'], req.body['createdDate'], req.body['author'], req.body['birdID']],function(err,row){
     if(err){ throw err;}
    res.json({'id':this.lastID});
    })
  }
})

app.get('/posts/:id', function (req, res) {
    
  const query = "SELECT * FROM POSTS INNER JOIN BIRDS ON BIRDS.birdID = POSTS.birdID WHERE POSTS.birdID = ?";
  //const query = "SELECT * from POSTS where birdID = ?";
    console.log(req.params.id);
    const params = [req.params.id];
    db.all(query, params, function (err, row) {
        if (err) {
            throw err;
        }
        res.render('showPosts', { posts: row });

    })
})

app.post('/addBirds',function(req,res){
    console.log(req.body);
    let sql = 'INSERT INTO birds( commonName, tailType, wingType, movement, size, color) VALUES (?,?,?,?,?,?)';
    db.run(sql, [req.body['commonName'], req.body['tailType'], req.body['wingType'], req.body['movement'], req.body['size'], req.body['color']],function(err,row){
     if(err){ throw err;}
    res.json({'id':this.lastID})
    })
})

app.get('/birds/:id', function (req, res) {
    const query = "SELECT * from BIRDS where birdID = ?";
    console.log(req.params.id);
    const params = [req.params.id];
    db.all(query, params, function (err, row) {
        if (err) {
            throw err;
        }
        res.json({
            'birds': row
        })
    })
})

app.post('/birds', (req, res) => {
    const { size } = req.body;
    const query = 'SELECT * FROM BIRDS WHERE size = ?';
    db.all(query, [size], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send('An error occurred while fetching data from the database');
      }
      res.render('birds', { birds: rows });
    });
  });

  app.post('/posts', (req, res) => {
    const { birdID } = req.body;
    const query = 'SELECT * FROM POSTS WHERE birdID = ?';
    db.all(query, [birdID], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send('An error occurred while fetching data from the database');
      }
      res.render('posts', { posts: rows });
    });
  });

  app.post('/users', (req, res) => {
    const { profile } = req.body;
    const query = 'SELECT * FROM USERS WHERE profile = ?';
    db.all(query, [profile], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send('An error occurred while fetching data from the database');
      }
      res.render('users', { users: rows });
    });
  });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.render('index');
  });

// Handling non matching request from the client 
app.use((req, res, next) => { 
  res.status(404).send( 
      "<h1>Page not found on the server</h1>") 
}) 

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


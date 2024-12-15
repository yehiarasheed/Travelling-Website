
var express = require('express');
var path = require('path');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',function(req,res){res.render('login')})
  app.listen(3000);
  
app.post('/registration',function(req,res)
{
  var user = req.body.username;
  var pass = req.body.password;
  console.log(user);
  console.log(pass);
})
//get for registration
app.get('/registration', (req, res) => {
  
  res.render('registration');
});

var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/MyDb", function (err, db) {
   
     if(err) throw err;

     //Write databse Insert/Update/Query code here..
                
});
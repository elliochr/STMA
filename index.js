let bodyParser = require('body-parser');
let path = require('path');
let mysql = require('./dbcon.js');
let fs = require('fs');

var express = require('express');
let app = express();
let hbs = require('express-handlebars').create({
    defaultLayout: 'main',
    extname: 'hbs',
    layoutDir: `${__dirname}/views/layouts`,
    partialsDir: `${__dirname}/views/partials`
});

// let multer = require('multer');
// let upload = multer();


//login/authentication 
var auth = require('./auth'); //module located in ./auth.js that is used to check if user is logged in. Login page is rendered if user not logged in.
var session = require('express-session');
var bcrypt = require('bcrypt'); //used to hash password - adds workload when hashing
const saltRounds = 10; //Used to determine server workload when hashing passwords
app.use(session({
    secret: "superSecretPassword",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        path: '/',
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }

}));


app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('port', 11113);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.static('public'));
//app.use('/', require('./queries.js'))

let cssFile;
app.get(`/css/${cssFile}`, function(req,res){
    res.send(`/css/${cssFile}`);
    res.end;
});
let jsFile;
app.get(`/js/${jsFile}`, function(req,res){
    res.send(`/js/${jsFile}`);
    res.end();
});
let imgFile;
app.get(`/img/${imgFile}`, function(req,res){
    res.send(`/img/${imgFile}`);
    res.end();
});


/******************************** Begin page Routes *************************************************/
app.get('/', function (req, res) {
    context = [];
    context.title = '';
    context.layout = 'loginLayout';
    res.render('login', context);
});

/******************************** End  Page Routes ************************************/
	
//404 error
app.use(function(req,res){
  res.type('plain/text');
  res.status(404);
  res.render('404');
});

//500 error
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log(`Express started on: ${app.get('port')}; press Ctrl-C to terminate.`);
})

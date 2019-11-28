let bodyParser = require('body-parser');
let path = require('path');
let mysql = require('./dbcon.js');              // set database connection
let fs = require('fs');                         // access to local files

var express = require('express');
let app = express();                            // begin application
let hbs = require('express-handlebars').create({
    defaultLayout: 'main',
    extname: 'hbs',                             // set file extension to .hbs
    layoutDir: `${__dirname}/views/layouts`,
    partialsDir: `${__dirname}/views/partials`
});

app.engine('hbs', hbs.engine);                      
app.set('view engine', 'hbs');
app.set('port', 11113);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.static('public'));                  // set name of public resource directory
//app.use('/', require('./queries.js'))

let cssFile;                                        // access to public css files
app.get(`/css/${cssFile}`, function(req,res){
    res.send(`/css/${cssFile}`);
    res.end;
});
let jsFile;                                         // access to public js files
app.get(`/js/${jsFile}`, function(req,res){
    res.send(`/js/${jsFile}`);
    res.end();
});
let imgFile;                                        // access to public image files
app.get(`/img/${imgFile}`, function(req,res){
    res.send(`/img/${imgFile}`);
    res.end();
});

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
        maxAge: 24 * 60 * 60 * 1000                 // set session timeout in ms
    }

}));

var query = require('./queries.js');                // db query functions file
/******************************** Begin page Routes *************************************************/
/** Home - login page route */
app.get('/', function (req, res) {
    context = {};
    context.title = '';
    context.layout = 'loginLayout';
    //res.render('login', context);                       // send login screen
    res.render('login', context);
});

// login authentication route - returns: fail login back to Home, success to admin or common menus based on permissions
app.post('/login', function (req, res, next) {
    var password = req.body.password;   
    var context = {};
    if (password == '') {                               // empty password
        context.invalid = true;
        res.render('login', context);                   //
    } else {
        query.getUser(res, mysql, password, userLoggedIn);    // check password
        // callback for getUser() queries
        function userLoggedIn(user, permission) {
            if (user){                                  // found user
                console.log(permission);
                req.session.userId = user.id;           // save session variables
                req.session.fName = user.first_name;
                req.session.lName = user.last_name;
		//req.session.pto = user.pto_available;
		//req.session.sto = user.sto_available;
                req.session.loggedIn = true;
                context.id = user.id;        // for more direct access to db
                context.fName = user.first_name;      // set for display in menu
                context.lName = user.last_name;
                context.pto = user.pto_available;
		context.sto = user.sto_available;
		if(permission < 3){
                    res.render('adminHome', context);   // return admin menu
                }
                else{
                    res.render('commonHome', context);  // return common menu
                }
            }
            else {
                context.invalid = true;                 // user not found
                res.render('login', context);           // return to login screen
            }
        }
    }

});

// register user route
app.post('/register', function (req, res, next) {
	//res.render('register');
	//console.log("test");
	//var inserts = [req.query.password, req.body.password, req.query.fname, req.body.fname];
	//console.log(inserts);
	mysql.pool.query("INSERT INTO personnel (`password`, `position`, `first_name`, `last_name`) VALUES(?, ?, ?, ?)",
	[req.body.password, 3, req.body.fname, req.body.lname], function (err, result) {
		if(err) {
			console.log(err);
			return;
		}
		else {
			//res.send("success?");
			//window.alert("Registation Sucessful!");
			res.render('adminHome');
		}
	});
});

app.post('/register-user', function(req, res, next) {
	res.render('register');
});

// logout route - !!not finalized!!
app.get('/logout', function (req, res, next) {
    req.session.loggedIn = false;
    req.session.destroy();                              // remove session
    res.redirect('/');                                  // return to login screen
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

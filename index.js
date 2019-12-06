let bodyParser = require('body-parser');
let path = require('path');
let mysql = require('./dbcon.js');              // set database connection
let fs = require('fs');                         // access to local files
let multer = require('multer');
let upload = multer();

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
// app.use(bodyParser.raw());
app.use(express.static('public'));                  // set name of public resource directory


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
        maxAge: 5 * 60 * 1000                 // set session timeout in ms
    }

}));

var query = require('./queries.js');                // db query functions file

// default logout procedure - can be used to help prevent unauthorized access
function logout(req, res) {
    req.session.loggedIn = false;
    req.session.destroy(); // remove session
    res.redirect('/'); // return to login screen
}

/******************************** Begin page Routes *************************************************/
/** Home - login page route */
app.get('/', function (req, res) {
    context = {};
    context.title = '';
    context.layout = 'loginLayout';
    context.login = true;
    res.render('login', context);                       // send login screen
});

// login authentication route - returns: fail login back to Home, success to admin or common menus based on permissions
app.post('/login', function (req, res, next) {
    var password = req.body.password;   
    var context = {};
    if (password == '') {                               // empty password
        context.invalid = true;
        res.render('login', context);                   //
    } 
    else {
        query.getUser(res, mysql, password, userLoggedIn);    // check password
        // callback for getUser() queries
        function userLoggedIn(user, permission) {
            if (user){                                  // found user
                console.log(permission);
                req.session.userId = user.id;           // save session variables
                req.session.fName = user.first_name;
                req.session.lName = user.last_name;
                req.session.permission = permission;
		        req.session.pto = user.pto_available;
		        req.session.sto = user.sto_available;
                req.session.loggedIn = true;
                // context.id = user.id;        // for more direct access to db
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

// return to main menu route
app.get('/menu', function(req, res, next){
    if(req.session.permission === 'undefined'){
        logout(req, res);
    }
    context = {}
    context.fName = req.session.fName;
    context.lName = req.session.lName;
    context.pto = req.session.pto;
    context.sto = req.session.sto;
    if(req.session.permission < 3){
        res.render('adminHome', context);
    }
    else{
        res.render('commonHome', context);
    }
})

// register user route
app.post('/register', function (req, res, next) {
	//res.render('register');
	//console.log("test");
	//var inserts = [req.query.password, req.body.password, req.query.fname, req.body.fname];
    //console.log(inserts);
    if(req.session.permission >= 3 || req.session.permission === 'undefined'){
        logout(req, res);
    }
	var context = {};
	context.fName = req.session.fName;
	context.lName = req.session.lName;
	mysql.pool.query("INSERT INTO personnel (`password`, `position`, `first_name`, `last_name`, `phone_num`, `email_address`, `start_date`, `pto_accumulation_rate`) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
	[req.body.password, req.body.position, req.body.firstName, req.body.lastName, req.body.phoneNumber, req.body.email, req.body.startDate, req.body.ptoRate], function (err, result) {
		if(err) {
			console.log(err);
			context.message= "Error in Registration :(";
			res.render('adminHome', context);
			return;
		}
		else {
			//res.send("success?");
			//window.alert("Registation Sucessful!");
			context.message = "Successful Registration!";	
			res.render('adminHome', context);
		}
	});
});

app.get('/register-user', function(req, res, next) {
    let context = {};
    query.getPosistions(res, mysql, positionsList);
    // callback for 
    function positionsList(positions){
        context.fName = req.session.fName;
        context.lName = req.session.lName;
        context.positions = positions;
        if (req.session.permission < 3){
            res.render('register', context);
        }
        else{
            logout(req, res);
        }
    }
});

app.get('/view-request', function(req, res, next) {
    var context = {};
    context.fName = req.session.fName;
    context.lName = req.session.lName;
    mysql.pool.query("SELECT personnel.first_name, personnel.last_name, personnel.pto_available, personnel.sto_available, pto_sto_request.request_date, pto_sto_request.req_type, pto_sto_request.req_description, pto_sto_request.approval_status FROM pto_sto_request INNER JOIN personnel ON personnel.idpersonnel = pto_sto_request.idpersonnel;", function(err, row){
        console.log(row);
        context.request = row;
        if(err) {
            console.log(err);
            context.message= "Error view-requests :(";
            res.render('adminHome', context);
        }
        else {
            res.render('viewRequests', context);
        }
    })
});

// View Personal Schedule route
app.get('/schedule', function(req, res){
    let context = {};
    // req.session.loggedIn = true;
    context.fName = req.session.fName;
    context.lName = req.session.lName;
    context.userId = req.session.userId;    // user id
    
    console.log();

    query.getUserSchedule(res, mysql, context, complete);
    
    function complete(){

        res.render('schedule', context);
    }
});

// Create new schedule route
app.get('/write-schedule', function(req, res){
    let context = {};
    context.fName = req.session.fName;
    context.lName = req.session.lName;
    context.script = ['writeSchedule.js'];
    
    res.render('createSchedule', context);
});

app.post('/writeSchedDate', upload.any(), function(req, res){
    if(req.session.permission < 3){
        let context = {};
        let schedule = JSON.parse(req.body.schedule);
        console.log(schedule);
        query.writeSchedDate(res, mysql, schedule, complete);

        function complete(response){
            res.send(response);
            res.end();
        }
    }
});

// get list of staff members
app.get('/getStaff', function (req, res) {
    if (req.session.permission < 3) {
        query.getStaffList(res, mysql, complete);

        function complete(results) {
            //console.log(`index: ${results}`);
            res.send(results);
            res.end();
        }
    }
    else {
        logout(req, res);
    }
});


// logout route
app.get('/logout', function (req, res, next) {
    logout(req, res);
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

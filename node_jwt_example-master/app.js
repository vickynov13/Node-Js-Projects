const jwt = require('jsonwebtoken');
var express = require('express')
var fs = require('fs')
var https = require('https')
var app = express()
var bodyParser = require('body-parser');
var mysql = require('mysql');
var url = require('url');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

var dbConn = mysql.createConnection({
    host: 'localhost',
    user: 'vicky',
    password: 'V!ckynov13',
    database: 'tasksapp'
});

dbConn.connect();

app.get('/api', (req, res) => {
	let name = 'vicky';
	//res.writeHead(200, {'Content-Type': 'JSON'});
	jwt.sign({name}, 'secretkey', { expiresIn: '1h' }, (err, token) => {
		console.log('read json')
		//res.json({ error:false, data : results, message : 'user has been updated successfully', token});
			//res.end();
		res.status(201);
		res.json({ error:false, message : 'user has been updated successfully out', token});
		});
	//res.write('{ message: Welcome to the API }');
});

app.post('/api/getusermain', (req, res) => {
	let userid = req.body.userid;
	dbConn.query("SELECT firstname, lastname, mobile, emailid from userprofiledata where userid = ?", [userid], function (error, results, fields) {	
        if (error){
			return res.send({ error: false, message:'Invalid Username / Password'});
		} else {
			//console.log('login success')
			return res.send({error: false, data: results });
		}
    });
	
});

app.post('/api/posts', verifyToken, (req, res) => {  
  jwt.verify(req.token, 'secretkey', (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      res.json({
        message: 'Post created...',
        authData
      });
    }
  });
});

app.post('/api/logins', (req, res) => {
  // Mock user
  let username = req.body.username;
  let pass = req.body.pass;
  let deviceid = req.body.deviceid;
  console.log(req.body);
  if (!username || !pass) {
        return res.status(400).send({ error: true, message: 'Please provide Username and Password' });
    }else{
		//dbConn.query("select userprofiledata.firstname as fname , userprofiledata.lastname as lname , userprofiledata.mobile as mobile , userprofiledata.emailid as email from userprofiledata, userlogindata where userlogindata.userid = (select userlogindata.userid from userlogindata where userlogindata.username=? and userlogindata.password=?) and  userlogindata.userid = userprofiledata.userid", [username, pass], function (error, results, fields) {
		dbConn.query("SELECT COUNT(userid) FROM userlogindata where username=? and password=?", [username, pass], function (error, results, fields) {	
        if (error){
			return res.send({ error: false, message:'Invalid Username / Password'});
		} else {
			console.log('login success')
			return res.send({error: false, data: results });
		}
    });
	}
});

app.post('/api/login', (req, res) => {
  // Mock user
  let username = req.body.username;
  let pass = req.body.pass;
  let deviceid = req.body.deviceid;
  console.log(req.body);
  if (!username || !pass) {
        return res.status(400).send({ error: true, message: 'Please provide Username and Password' });
    }else{
		//dbConn.query("select userprofiledata.firstname as fname , userprofiledata.lastname as lname , userprofiledata.mobile as mobile , userprofiledata.emailid as email from userprofiledata, userlogindata where userlogindata.userid = (select userlogindata.userid from userlogindata where userlogindata.username=? and userlogindata.password=?) and  userlogindata.userid = userprofiledata.userid", [username, pass], function (error, results, fields) {
		dbConn.query("SELECT COUNT(userid) FROM userlogindata where username=? and password=?", [username, pass], function (error, results, fields) {	
        if (error){
			//return res.send({ error: false, message:'Invalid Username / Password'});
		} else {
			dbConn.query("select userid from userlogindata where username=? and password=?", [username, pass], function (error, results1, fields) {	
				if (error){
					return res.send({ error: false, message:'Could not get data'});
				} else {
					console.log('login success')
					return res.send({error: false, data: results, data1: results1 });
				}
			});
			//return res.send({error: false, data: results });
		}
    });
	}
});




app.put('/api/login1', (req, res) => {
  // Mock user
  let name = req.body.name;
  let email = req.body.email;
 
  dbConn.query("select name from users where name = ? and email = ?", [name, email], function (error, results, fields) {
        if (error){
			res.sendStatus(403);
		} else {
			
			jwt.sign({name}, 'secretkey', { expiresIn: '30s' }, (err, token) => {
			res.json({
			error: false, data: results,
			message: 'user has been updated successfully.',
			token
    });
  });
}
});
});

app.put('/api/user', (req, res) => {
  
  let name = req.body.name;
  let email = req.body.email;
  
    if (!name || !email) {
        return res.status(400).send({ error: name, message: 'Please provide user and user_id' });
    }

    dbConn.query("select name from users where name = ? and email = ?", [name, email], function (error, results, fields) {
        if (error){
			res.sendStatus(403);
		} else{
        return res.send({ error: false, data: results, message: 'user has been updated successfully.' });
		}
    });
});

app.put('/api/user1', (req, res) => {
  
  let name = req.body.name;
  let email = req.body.email;
  console.log(req.body);
    dbConn.query("select name, email from users where name = ? and email = ?", [name, email], function (error, results, fields) {
        if (error){
			res.sendStatus(403);
		} else{
		var string=JSON.stringify(results);
        var json =  JSON.parse(string);
		console.log(json[0].email);
		if(email==json[0].email){
        jwt.sign({name}, 'secretkey', { expiresIn: '1h' }, (err, token) => {
			res.json({
			error: false, data: results,
			message: 'user has been updated successfully.',
			token
    });
		});}
		}
    });
});
app.put('/api/register', (req, res) => {
  let username = req.body.username;
  let password = req.body.pass;
  let fname = req.body.fname;
  let lname = req.body.lname;
  let mobile = req.body.mobile;
  let email = req.body.email;
console.log(req.body);
 /* Begin transaction */
dbConn.beginTransaction(function(err) {
if(err){
	return res.send({ error: false, message: err });
}else{
	dbConn.query("INSERT INTO userlogindata (username, password) VALUES(?, ?)",[username,password], function(err, result) {
	if(err){
	dbConn.rollback(function() {
            return res.send({ error: false, message: err });
          });
	}else{
	dbConn.query("INSERT INTO userprofiledata (userid, username, firstname,lastname, mobile,emailid) VALUES((SELECT userid FROM userlogindata where username = ?),?,?,?,?,?)", [username,username,fname,lname,mobile,email], function(err, result) {
		if(err){
		dbConn.rollback(function() {
            return res.send({ error: false, message: err });
          });
		}else{
		dbConn.commit(function(err) {
		if(err){
		dbConn.rollback(function() {
            return res.send({ error: false, message: err });
          });
		}else{
		return res.send({ error: false, message: 'Update Successful' });
		}
		});
		}
	});
	}
	});
}
});
/* End transaction */   
});

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next) {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }

}
var options ={
	  key: fs.readFileSync('cert/mykey.pem'),
	  cert: fs.readFileSync('cert/my-cert.pem')
}
https.createServer(options, app)
.listen(4050, function () {
  console.log('service running on https://localhost/')
})
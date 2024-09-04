var express = require('express')
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var app = express()
var url = 'mongodb://localhost:27017/' + process.argv[2];
var table = process.argv[3]
app.use(bodyParser.json());



//Connects mongodb on init, if success serves the APIs else returns.
MongoClient.connect(url, function(err, db) {
  if(err){
    console.log('Connection unsuccessful');
    return;
  }
  console.log("Connected correctly to server.");
  db.close();
  //Serve the APIs
  app.listen(process.argv[4], function () {
    console.log('App listening on port ' + process.argv[4] + "!")
  })
});


//For user signup
app.post('/signup', function (request, response) {

  //Checks mandatory fields if found empty or null returns
  if(!request.body.username  || !request.body.name  || !request.body.password  || !request.body.email  ||  !request.body.dob  || request.body.username == '' || request.body.name == '' || request.body.password == '' || request.body.email == '' || reques.body.dob == ''){
    response.send('All fields are mandatory')
    return;
  }
  //Generate hash to store
  hash = bcrypt.hashSync(request.body.password, 10);
  MongoClient.connect(url, function(err, db) {
    //Insert user into the db
    db.collection(table).insertOne({
      'username' : request.body.username,
      'name'     : request.body.name,
      'password' : hash,
      'email'    : request.body.email,
      'dob'      : reques.body.dob
    }, function(err, result) {
      if(err){
        assert.equal(err, null);
      }
      else {
        response.send('Signup successful')
      }
      db.close()
    });
  })
})


//For login
app.post('/login', function (request, response) {
  //Checks mandatory fields if found empty or null returns
  if(!request.body.username  || !request.body.password  || request.body.username == '' || request.body.password == ''){
    response.send('All fields are mandatory')
    return;
  }
  MongoClient.connect(url, function(err, db) {
    //Find the user details
    db.collection(table).findOne({ "username": request.body.username },function(err, user) {
      assert.equal(err, null);
      console.log(user);
      if(user == null){
        response.send('Username not found.')
      }
      else{
        if(bcrypt.compareSync(request.body.password, user.password)) {
         // Passwords match
         response.send('Login successful')
        } else {
         // Passwords don't match
         response.send('Wrong Password.')
        }
      }
    });
  })
})



//To get specific user details
app.get('/users/:userName',function(request,response){
  MongoClient.connect(url, function(err, db) {
    db.collection(table).findOne({ "username": request.params.userName },function(err, user) {
      if(user == null){
        //If no user is found
        response.send('User not found.')
      }
      else {
        //Return the user data
        response.send(JSON.stringify({
          'username': user.username,
          'email'   : user.email,
          'name'    : user.name,
          'dob'     : user.dob
        }));
      }
    })
  })
})

//To update user info
app.post('/updateInfo', function (request, response) {
  MongoClient.connect(url, function(err, db) {
    db.collection(table).updateOne(
      { 'username' : request.body.username },
      {
        $set: {
          'name'     : request.body.name,
          'email'    : request.body.email,
          'dob'      : request.body.dob,
        },
        $currentDate: { "lastModified": true }
      }, function(err, result) {
      assert.equal(err, null);
      response.send('Profile updated successfully')
      db.close()
    });
  })
})

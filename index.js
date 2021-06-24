const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const express = require("express");
const app = express();
const session = require("express-session");
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
const fs = require("fs");

app.use(bodyParser.json());

//Add these headers, very important!
app.use(function (req, res, next) {
  //allow all origins
  res.header("Access-Control-Allow-Origin", "*");

  //allow headers "Origin", "X-Requested-With", "Content-Type"
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//Session

app.use(session({
  secret: 'session-key',
  resave: false,
  saveUninitialized: true
}));

//Registeration part
app.post("/kayitol", urlencodedParser, (req, res) => {
  try {
    let fullname = req.body.fullname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let password = req.body.password;
    if(fullname && lastname && email && password){
      MongoClient.connect(url, function (err, client) {
        if (err) {
          //validates if "err" object has a value, if it does the endpoint will return an 500 error (server error)
          client.close();
          return res.status(500).send("error");
        }

        const db = client.db("comics");
        const collection = db.collection("superheroes");

        const doc = { fullname: fullname, lastname: lastname, email: email, password: password }; //define the new record, using the values obtained from the request
        collection.find().toArray(function(err,result){
          if(err){
            return res.status(400).send("badrequest");
          }else{
            let i=0;
            result.forEach(emailcontrol=>{
              if(emailcontrol.email==email){
                i++;
              }
            });
            if(i==0){
              collection.insertOne(doc,(err,result)=>{
                if(err){
                  client.close();
                  return res.status(500).send("error");
                }
                client.close();
                return res.status(200).send("you are directing to home page");
              });
            }else{
              return res.status(400).send("This account has already been exist");
            }
          }
        });
        
      });
    }else{
      return res.status(400).send("bad request");
    }
  }catch (ex) {
    //if there is any exception, the endpoint will return an 500 error (server error)
    return res.status(500).send("error");
  }
});

// Login Post
app.post("/girisyap", urlencodedParser, (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    //console.log(email,password);
    if(email && password){
      MongoClient.connect(url, function (err, client) {
        if (err) {
          //validates if "err" object has a value, if it does the endpoint will return an 500 error (server error)
          client.close();
          return res.status(500).send("error");
        }
        const db = client.db("comics");
        const collection = db.collection("superheroes");

        const doc = {email: email, password: password }; //define the new record, using the values obtained from the request
        collection.find({}).toArray(function(err,result){
          if(err){
            return res.status(400).send("badrequest");
          }
          let i=0;
          result.forEach(control=>{
            if(control.email==doc.email && control.password==doc.password){
              i++;
            }
          });
          if(i==0){
            return res.status(400).send("badrequest");
            client.close();
          }else{
            req.session.email=email;
            return res.status(200).send("login is successfull");
            client.close();
          }
        });
      });
    }else{
      return res.status(400).send("bad request");
    }
  }catch (ex) {
    //if there is any exception, the endpoint will return an 500 error (server error)
    return res.status(500).send("error");
  }
});


app.listen(3000, () => {
  console.log("Example app listening on port 3000!");
});
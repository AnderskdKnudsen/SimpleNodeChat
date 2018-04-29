const express = require("express");
const app = express();
const bodyParser = require("body-parser");

var startPage = {
    index: "login.html"
};

//Handle login

//Body-parser and static(with selected startpage)
app.use("/", express.static("public", startPage));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Objection and knex setup
const objection = require("objection");
const Model = objection.Model;
const Knex = require("knex");
const knexConfig = require("./knexfile.js");
const knex = Knex(knexConfig.development);

Model.knex(knex);

//Nodemailer
const nodemailer = require("nodemailer");   
const mailCredentials = require("./config/mail_credentials.js");

var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: mailCredentials.mail,
        pass: mailCredentials.password
    }
});

const db = {
    "Knex": knex,
    "User": require("./models/User.js")
}

//brcypt
const bcrypt = require("bcrypt");
const saltRounds = 10;

const server = app.listen(3000, err => {
    if(err)
        console.log("Error connecting on port", server.address().port + " " + err.stack);
    else
        console.log("Connected to server on port", server.address().port);
});

app.post("/login-user", (req, res) => {
    let response = {};

    db.User.query().select().where("username", req.body.username)
        .then(foundUsers => {
            if(foundUsers.length === 0){
                response.status = 404,
                response.message = "Error! User not found!"

                res.send(response);
            } else if(foundUsers.length >= 1){
                bcrypt.compare(req.body.password, foundUsers[0].password)
                    .then(found => {
                        if(found) {
                            response.status = 200;
                            response.message = "Successfully logged in!";

                            res.send(response);
                        } else {
                            response.status = 403;
                            response.status = "Incorrect login! Try Again.";

                            res.send(response);
                        }
                    });
            }
        }).catch(err => {
            response.status = 500,
            response.message = "Error querying database! Try again later";

            res.send(message);
        });

});

app.post("/submit-user", (req, res) => {
    let response = {};

    db.User.query().select().where("username", req.body.username)
        .orWhere("email", req.body.email)
        .then(foundUsers => {
            if(foundUsers.length > 0){
                if(foundUsers[0].email === req.body.email) {
                    response.status = 403;
                    response.message = "Error! E-mail already used.";

                    res.send(response);
                } else {
                    response.status = 403;
                    response.message = "Error! Username taken.";
    
                    res.send(response);
                }
            } else {
                bcrypt.hash(req.body.password, saltRounds)
                    .then(hash => {
                        db.User.query().insert({
                            "username": req.body.username,
                            "password": hash,
                            "email": req.body.email
                        }).then(persistedUser => {
                            response.status = 200;
                            response.message = "User successfully created!";

                            var mailOptions = {
                                from: mailCredentials.mail,
                                to: req.body.email,
                                subject: "Welcome, welcome.",
                                text: "Welcome " + req.body.username + " to simplenodechat.awersome!"
                            };

                            transporter.sendMail(mailOptions, (err, info) => {
                                if(err) {
                                    response.mailstatus = 403;
                                    response.mailinfo = "Error sending confirmation mail!";
                                }
                                else {
                                    response.mailstatus = 200;
                                    response.mailinfo = "Mail sent!";
                                }
                            });
                            res.send(response);
                        }).catch(err => {
                            response.status = 500;
                            response.message = "Error! Database might be down. Try again later";

                            res.send(response);
                        });
                    });
            }
        }).catch(err => {
            response.status = 500;
            response.message = "Error! Our server might be down. Try again later";

            res.send(response);
        });
});
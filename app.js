const express = require("express");
const app = express();
const bodyParser = require("body-parser");

//socket
const server = require("http").Server(app);
let io = require("socket.io")(server);

//Sets port
app.set('port', process.env.PORT || 3000);

var startPage = {
    index: "login.html"
};

// This file is split up in:
// First: Setup(require, initialization of objects and stuff)
// Second: The actual API
// Third: Socket(with setup and functions)
// Fourth: Testing(mocha/chai)

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

server.listen(app.get("port"), err => {
    if (err)
        console.log("Error connecting on port", app.get("port") + " " + err.stack);
    else
        console.log("Connected to server on port", app.get("port"));
});

app.post("/login-user", (req, res) => {
    let response = {};

    db.User.query().select().where("username", req.body.username)
        .then(foundUsers => {
            if (foundUsers.length === 0) {
                response.status = 404,
                    response.message = "Incorrect login! Try again or make a new user!";

                res.send(response);
            } else if (foundUsers.length >= 1) {
                bcrypt.compare(req.body.password, foundUsers[0].password)
                    .then(found => {
                        if (found) {
                            response.status = 200;
                            response.message = "Successfully logged in!";

                            res.send(response);
                        } else {
                            response.status = 404;
                            response.message = "Incorrect login! Try again or make a new user!";

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
            if (foundUsers.length > 0) {
                if (foundUsers[0].email === req.body.email) {
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
                                text: "Welcome " + req.body.username + " to simplenodechat.awesome!"
                            };

                            transporter.sendMail(mailOptions, (err, info) => {
                                if (err) {
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

let messages = [];
let userColors = [];
let usersAndNumber = {
    users: [],
    numberOfClients: 0
}

const colors = [
    '#55efc4',
    '#81ecec',
    '#74b9ff',
    '#fab1a0',
    '#636e72',
    '#fdcb6e',
    '#d63031',
    '#6c5ce7',
    '#3742fa'
];

io.on("connection", socket => {
    let socketUsername = "";
    usersAndNumber.numberOfClients++;

    socket.emit("askForUsername");
    socket.on("foundUsername", (username) => {
        socketUsername = username;

        usersAndNumber.users.push(username);
        io.emit("updateUsers", usersAndNumber);

    });



    socket.on("disconnect", () => {
        usersAndNumber.numberOfClients--;
        colors.push(userColors[userId]);
        delete userColors[userId];

        let index = usersAndNumber.users.indexOf(socketUsername);
        if (index !== -1) usersAndNumber.users.splice(index, 1);

        io.emit("updateUsers", usersAndNumber);

    });

    const userId = socket.id;
    const randomIndex = Math.floor(Math.random() * colors.length);

    userColors[userId] = colors[randomIndex];
    const userColor = userColors[userId];

    let colorIndex = colors.indexOf(userColor);
    if (colorIndex !== -1) colors.splice(colorIndex, 1);

    socket.on("chat message", msg => {
        msg.color = userColor;

        if (messages.length >= 10)
            messages.shift();
        messages.push(msg);

        io.emit("chat message", msg);
    });
});

app.get("/get-messages", (req, res) => {
    res.send(messages);
});


//TEST

module.exports.queryDb = async function (username) {
    var foundUsername = false

    await db.User.query().select().where("username", username)
        .then(foundUser => {
            if (foundUser.length === 0) return foundUsername;
            if (foundUser[0].username === username) foundUsername = true;

        });

    return foundUsername;
}
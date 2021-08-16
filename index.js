const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const app = express();
const apiPort = 3001;
const { Book } = require('./models/book-model');
const { User } = require("./models/user-model");

mongoose.connect('mongodb+srv://jmkemp20:jajabinks@classroomlibdb.rpwpl.mongodb.net/ClassroomLibDB?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).catch(e => {
    console.error('Connection Error', e.message);
});

const db = mongoose.connection;

/*
const testUser = new User({
    firstName: 'Joshua',
    lastName: 'Kemp',
    country: 'United States',
    address: '952 Stockleybridge Drive, Chesapeake VA',
    phone: '757-724-2212',
    numClasses: 1,
    classes: ['A Bell'],
    email: 'jkemp952@gmail.com',
    password: 'password123'
});

testUser.save((err) => {
    if (err) throw err;
});
*/

db.on('connected', () => {
    console.log("Connected to MONGODB")
})

db.on('error', console.error.bind(console, 'connection error:'));

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/library", (req, res) => {
    Book.find((error, result) => {
        res.send(result);
    });
});

app.post('/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const tempUser = new User ({
      firstName: firstName,
      lastName: lastName,
      country: "United States",
      address: "",
      phone: "",
      numClasses: 1,
      classes: ["Main"],
      email: email,
      password: password,
    });
    tempUser.save((err) => {
      if (err) throw err;
    });
    console.log(`Registered New User: ${email}`);
    res.send("Success");
})

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));

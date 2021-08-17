const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const app = express();
const apiPort = 3001;
const { Book } = require('./models/book-model');
const { User } = require("./models/user-model");
const { Student } = require("./models/student-model");

mongoose.connect('', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).catch(e => {
    console.error('Connection Error', e.message);
});

const db = mongoose.connection;

/*
const testStudent = new Student({
    name: 'Joshua Kemp',
    parent_id: '611b0601c0a68118a067277a',
    classroom: 'A Block',
    email: 'jkemp952@gmail.com',
    num_books: 1,
    book_list: ['6116bece868a12c9eb427c69']
});

testStudent.save((err) => {
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
    res.end("Success");
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email: email }, (err, user) => {
        if (err) throw err;
        if (user !== null) {
            user.comparePassword(password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    const data = {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        country: user.country,
                        address: user.address,
                        phone: user.phone,
                        numClasses: user.numClasses,
                        classes: user.classes
                    }
                    res.send(data);
                } else {
                    res.send(false);
                }
            });
        } else {
            res.send(false);
        }
    });
});

app.post('/students', (req, res) => {
    const parentId = req.body.userId;
    Student.find({ parent_id: parentId }, (err, result) => {
        console.log(result);
        res.json(result);
    });
});

app.post("/library", (req, res) => {
    Book.find((error, result) => {
        res.json(result);
    });
});

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));

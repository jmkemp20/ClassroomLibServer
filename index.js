const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const apiPort = 3001;
const { Book } = require("./models/book-model");
const { User } = require("./models/user-model");
const { Student } = require("./models/student-model");

mongoose
  .connect(
    "mongodb+srv://jmkemp20:jajabinks@classroomlibdb.rpwpl.mongodb.net/ClassroomLibDB?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  )
  .catch((e) => {
    console.error("Connection Error", e.message);
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

db.on("connected", () => {
  console.log("Connected to MONGODB");
});

db.on("error", console.error.bind(console, "connection error:"));

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const tempUser = new User({
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

app.post("/login", (req, res) => {
  const { lastLogin, email, password } = req.body;
  User.findOne({ email: email }, (err, user) => {
    if (err) throw err;
    if (user !== null) {
      user.comparePassword(password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          User.updateOne(
            { email: email },
            { lastLogin: lastLogin },
            { upsert: true },
            (err, doc) => {
              if (err) return res.send(500, { error: err });
              return;
            }
          );
          const data = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            country: user.country,
            address: user.address,
            phone: user.phone,
            numClasses: user.numClasses,
            classes: user.classes,
          };
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

app.post("/students", (req, res) => {
  const parentId = req.body.userId;
  Student.find({ parent_id: parentId }, (err, result) => {
    res.json(result);
  });
});

app.post("/studentsBooks", (req, res) => {
  const { parentId, studentId } = req.body;
  const returnData = [];
  Student.findOne({ _id: studentId, parent_id: parentId }, (err, result) => {
    if (result) {
        for (const i in result.book_list) {
            bookId = mongoose.Types.ObjectId(result.book_list[i]);
            Book.findOne({ _id: bookId},
            (err, book) => {
                if (err) throw err;
                console.log(`Pushing book: ${book.title}`);
                returnData.push(book);
                if (result.book_list.length === Object.keys(returnData).length) {
                    res.json(returnData);
                }
            }
            );
        }
    }   
  });
});

app.post("/library", (req, res) => {
  const parentId = req.body.userId;
  Book.find({ parent_id: parentId }, (error, result) => {
    res.json(result);
  });
});

app.post("/newStudent", (req, res) => {
  const { userId, name, email, className } = req.body;
  const tempStudent = new Student({
    name: name,
    parent_id: userId,
    email: email,
    classroom: className,
    num_books: 0,
    book_list: [],
  });
  tempStudent.save((err) => {
    if (err) throw err;
    const data = {
      name: name,
      parent_id: userId,
      email: email,
      classroom: className,
      num_books: 0,
      book_list: [],
    };
    res.send(data);
  });
  console.log(`Registered New Student: ${name}`);
});

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));

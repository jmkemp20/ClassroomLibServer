const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const axios = require("axios");
const apiPort = 3001;
const ISBNConverter = require("simple-isbn").isbn;
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
        Book.findOne({ _id: bookId }, (err, book) => {
          if (err) throw err;
          console.log(`Pushing book: ${book.title}`);
          returnData.push(book);
          if (result.book_list.length === Object.keys(returnData).length) {
            res.json(returnData);
          }
        });
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

const isValidISBN = (str) => {
  var sum, weight, digit, check, i;

  str = String(str).replace(/[^0-9X]/gi, "");

  if (str.length != 10 && str.length != 13) {
    return false;
  }

  if (str.length == 13) {
    sum = 0;
    for (i = 0; i < 12; i++) {
      digit = parseInt(str[i]);
      if (i % 2 == 1) {
        sum += 3 * digit;
      } else {
        sum += digit;
      }
    }
    check = (10 - (sum % 10)) % 10;
    return check == str[str.length - 1];
  }

  if (str.length == 10) {
    weight = 10;
    sum = 0;
    for (i = 0; i < 9; i++) {
      digit = parseInt(str[i]);
      sum += weight * digit;
      weight--;
    }
    check = (11 - (sum % 11)) % 11;
    if (check == 10) {
      check = "X";
    }
    return check == str[str.length - 1].toUpperCase();
  }
};

app.post("/newBook", (req, res) => {
  const { userId, title, author, isbn, date, publisher, pages, description } =
    req.body;
  if (!isValidISBN(isbn)) {
    res.sendStatus(400);
  }
  const tempBook = new Book({
    _id: mongoose.Types.ObjectId(),
    parent_id: userId,
    authors: author,
    title: title,
    description: description,
    copies: 1,
    publisher: publisher,
    publish_date: date,
    pages: pages,
  });
  if (String(isbn).length == 10) {
    tempBook.isbn10 = isbn;
    tempBook.isbn13 = ISBNConverter.toIsbn13(String(isbn));
  } else {
    tempBook.isbn13 = isbn;
    tempBook.isbn10 = ISBNConverter.toIsbn10(String(isbn));
  }
  tempBook.save((err) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(200);
  });
});

app.post("/newBookAuto", async (req, res) => {
  const { userId, isbn } = req.body;
  if (isValidISBN(isbn)) {
    const bookuri = "https://openlibrary.org/isbn/" + isbn + ".json";
    axios.get(bookuri, {}).then((response) => {
      if (response.status == 200) {
        const authoruri =
          "https://openlibrary.org" + response.data.authors[0].key + ".json";
        axios.get(authoruri, {}).then((authResponse) => {
          if (authResponse.status == 200) {
            const tempBook = new Book({
              _id: mongoose.Types.ObjectId(),
              parent_id: userId,
              authors: authResponse.data.name,
              title: response.data.title,
              description: "No Description Found",
              copies: 1,
              publisher:
                response.data.publishers.length > 0
                  ? response.data.publishers[0]
                  : "",
              publish_date: response.data.publish_date,
              pages: response.data.number_of_pages,
              isbn10:
                response.data.isbn_10.length > 0
                  ? response.data.isbn_10[0]
                  : "",
              isbn13:
                response.data.isbn_13.length > 0
                  ? response.data.isbn_13[0]
                  : "",
            });
            const myQuery = (isbn.length == 10 ? { isbn10: isbn } : { isbn13: isbn });
            Book.findOne(myQuery, (newErr, book) => {
              if (newErr) res.sendStatus(500);
              if (book) {
                book.copies += 1;
                book.save((err) => {
                  if (err) return res.sendStatus(500);

                  console.log(`Success Auto Updated: ${tempBook.title}`);
                  const tempData = {
                    statusCode: 201,
                    returnBody: {
                      message: "Book already exists",
                      copies: book.copies,
                    },
                  };
                  return res.send(tempData);
                });
              } else {
                tempBook.save((err) => {
                  if (err) return res.sendStatus(500);

                  console.log(`Success Auto Added: ${tempBook.title}`);
                  const tempData = {
                    statusCode: 200,
                    returnBody: {
                      title: tempBook.title,
                      author: tempBook.authors,
                    },
                  };
                  return res.send(tempData);
                });
              }
            });
          } else {
            res.sendStatus(500);
          }
        });
      } else {
        res.sendStatus(500);
      }
    });
  } else {
    res.sendStatus(500);
  }
});

app.post("/deleteBook", (req, res) => {
  const { userId, bookId } = req.body;
  Book.deleteOne({ _id: bookId, parent_id: userId }, (err) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(200);
  });
});

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
    _id: Number,
    authors: String,
    first_name: String,
    last_name: String,
    title: String,
    description: String,
    rating: String,
    review_data: String,
    review: String,
    status: String,
    began_date: String,
    completed_date: String,
    tags: String,
    notes: String,
    groups: String,
    copies: Number,
    created: String,
    publisher: String,
    publish_date: String,
    pages: Number,
    price: String,
    isbn10: String,
    isbn13: Number
},
{ collection: 'ClassroomBooks'}
);

const Book = mongoose.model('book', bookSchema);

module.exports = { Book };
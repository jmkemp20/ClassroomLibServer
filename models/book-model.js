const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema(
  {
    _id: Schema.ObjectId,
    parent_id: { type: Schema.ObjectId, ref: "User", required: true },
    authors: { type: String, required: true },
    first_name: String,
    last_name: String,
    title: { type: String, required: true },
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
    isbn10: { type: Schema.Types.Mixed, index: { unique: true } },
    isbn13: { type: Schema.Types.Mixed, index: { unique: true } },
  },
  { collection: "ClassroomBooks", timestamps: true }
);

const Book = mongoose.model('book', bookSchema);

module.exports = { Book };
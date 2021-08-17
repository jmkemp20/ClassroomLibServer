const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: String,
    parent_id: {type: Schema.ObjectId, ref: 'User' },
    classroom: String,
    email: String,
    num_books: Number,
    book_list: [{type: Schema.ObjectId, ref: 'Book' }],
}, { collection: 'ClassroomStudents' });

const Student = mongoose.model("student", studentSchema);

module.exports = { Student };
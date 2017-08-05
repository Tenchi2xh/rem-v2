let mongoose = require('mongoose');
let quizAnswersSchema = mongoose.Schema({
    id: String,
    date: Date,
    answer: String,
    user: String,
    quizId: String
});
let quizModel = mongoose.model('quizAnswers', quizAnswersSchema);
module.exports = quizModel;
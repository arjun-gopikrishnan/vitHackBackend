const mongoose = require('mongoose');
const validator = require('validator');

const repoScheme = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    courseDesc: {
        type: String,
        trim: true
    },
    topicInfo: [],
    courseLinks: [],
    tags: []
});

const Repo = mongoose.model('Repo', repoScheme);

module.exports = Repo;
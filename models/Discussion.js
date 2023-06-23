const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
    owner: {type:mongoose.Schema.Types.ObjectId, ref:'user'},
    id:String,
    title:String,
    description:String,
    photos:[String],
});

const discussionModel = mongoose.model('Discussion', discussionSchema);

module.exports = discussionModel;
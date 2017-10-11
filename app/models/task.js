var mongoose = require('mongoose');

var taskSchema = mongoose.Schema({
   
   owner : String,
   column : Number,
   body: String,
   due: Date,
   subject: String
   
   
    
});

module.exports = mongoose.model('Task', taskSchema);
const mongoose = require('mongoose')
const { Schema } = mongoose

const todoSchema = new Schema({
  todo: {
    type: String,
    require: true
  },
  completed: {
    type: Boolean,
    require: true
  },
  userId: String
}, {
    timestamps: true
})

module.exports = mongoose.model('Todo', todoSchema)



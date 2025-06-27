const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    prompt: String,
    response: String,
    userId: {
      type: String, // hoặc mongoose.Schema.Types.ObjectId nếu liên kết với User
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);

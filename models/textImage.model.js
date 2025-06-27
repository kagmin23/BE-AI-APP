const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageBase64: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Image", imageSchema);

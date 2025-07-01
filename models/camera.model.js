const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema(
  {
    cameraData: {
      type: String, // base64 hoặc image URL
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Tránh OverwriteModelError
const Camera = mongoose.models.Camera || mongoose.model("Camera", cameraSchema);

module.exports = Camera;

const Camera = require("../models/camera.model");

exports.uploadCamera = async (req, res) => {
  const { camera } = req.body;

  if (!camera) {
    return res.status(400).json({ error: "Camera data is required." });
  }

  try {
    const newCamera = new Camera({ cameraData: camera });
    await newCamera.save();
    res
      .status(201)
      .json({ message: "Camera uploaded successfully", id: newCamera._id });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getCameras = async (req, res) => {
  try {
    const cameras = await Camera.find().sort({ createdAt: -1 });
    res.json(cameras);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteCamera = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Camera.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Photo not found." });
    }

    res.json({ message: "Photo deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

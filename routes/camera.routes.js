const express = require("express");
const router = express.Router();
const {
  uploadCamera,
  getCameras,
  deleteCamera
} = require("../controllers/camera.controller");

router.post("/upload", uploadCamera);
router.get("/list", getCameras);
router.delete("/delete/:id", deleteCamera)

module.exports = router;

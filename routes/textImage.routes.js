const express = require("express");
const router = express.Router();
const { textImage, getImages } = require("../controllers/textImage.controller");

router.post("/generate-image", textImage);
router.get("/history-images", getImages);

module.exports = router;

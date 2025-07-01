const express = require("express");
const router = express.Router();
const {
    textImage,
    getImages,
    updateImage,
    deleteImage,
} = require("../controllers/textImage.controller");

router.post("/generate-image", textImage);
router.get("/history-images", getImages);
router.put("/update-image/:id", updateImage);
router.delete("/delete-image/:id", deleteImage);

module.exports = router;

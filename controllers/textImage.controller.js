const axios = require("axios");
const ImageModel = require("../models/textImage.model"); // đảm bảo đã tạo model

const textImage = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.length < 3) {
    return res.status(400).json({ error: "Prompt is too short" });
  }

  try {
    console.log("🎨 Generating image for prompt:", prompt);

    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}`;

    console.log("🔗 Image URL:", imageUrl);

    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const imageBuffer = Buffer.from(response.data);
    const imageBase64 = imageBuffer.toString("base64");

    // ✅ Lưu vào MongoDB
    const saved = await ImageModel.create({
      prompt,
      imageUrl,
      imageBase64, // nếu không muốn lưu base64 có thể bỏ dòng này
    });

    res.json({
      success: true,
      prompt,
      imageUrl,
      imageBase64: `data:image/jpeg;base64,${imageBase64}`,
      id: saved._id,
      createdAt: saved.createdAt,
    });
  } catch (err) {
    console.error("❌ Pollinations error:", err.message);
    console.error("Full error:", err.response?.data || err);

    res.status(500).json({
      success: false,
      error: "Không thể tạo ảnh từ Pollinations",
      details: err.message,
    });
  }
};

// ✅ Controller: lấy danh sách ảnh đã lưu
const getImages = async (req, res) => {
  try {
    const images = await ImageModel.find()
      .sort({ createdAt: -1 }) // mới nhất trước
      .limit(100); // giới hạn nếu cần

    res.json({ success: true, images });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, error: "Không thể tải danh sách ảnh" });
  }
};

// Update
const updateImage = async (req, res) => {
  const { id } = req.params;
  const { prompt } = req.body;

  if (!prompt || prompt.length < 3) {
    return res.status(400).json({ error: "Prompt is too short" });
  }

  try {
    console.log("🔄 Updating image with new prompt:", prompt);

    // Generate new image with updated prompt
    const encodedPrompt = encodeURIComponent(prompt);
    const newImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Date.now()}`;

    const response = await axios.get(newImageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const imageBuffer = Buffer.from(response.data);
    const imageBase64 = imageBuffer.toString("base64");

    // Cập nhật bản ghi
    const updated = await ImageModel.findByIdAndUpdate(
      id,
      {
        prompt,
        imageUrl: newImageUrl,
        imageBase64,
        updatedAt: Date.now(),
      },
      { new: true } // trả về bản ghi mới sau update
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: "Image not found" });
    }

    res.json({
      success: true,
      image: updated,
    });
  } catch (err) {
    console.error("❌ Error when updating image:", err.message);
    res.status(500).json({
      success: false,
      error: "Can not update image with new prompt",
      details: err.message,
    });
  }
};

// Delete
const deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await ImageModel.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Image not found" });
    }

    res.json({ success: true, message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Can not delete image" });
  }
};

module.exports = {
  textImage,
  getImages,
  updateImage,
  deleteImage,
};

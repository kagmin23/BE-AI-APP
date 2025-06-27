const axios = require("axios");
const Chat = require("../models/chat.model");
require("dotenv").config();

const sendMessage = async (req, res) => {
  const { message, userId } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Missing message" });
  }

  try {
    const result = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      result.data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ Gemini.";

    // Lưu vào MongoDB
    await Chat.create({
      prompt: message,
      response: reply,
      userId: userId || null,
    });

    res.json({ reply });
  } catch (err) {
    console.error("Gemini error:", err.response?.data || err.message);
    res.status(500).json({ error: "Gemini API error" });
  }
};

// Lấy toàn bộ lịch sử chat hoặc theo userId
const getChatHistory = async (req, res) => {
  const { userId } = req.query;

  try {
    const chats = await Chat.find(userId ? { userId } : {}).sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error("History fetch error:", err.message);
    res.status(500).json({ error: "Failed to load history" });
  }
};

// Lấy lịch sử theo userId
const getChatHistoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const chats = await Chat.find({ userId: id }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error("Error fetching chat by ID:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cập nhật prompt → Gemini phản hồi lại → lưu lại prompt & response mới
const updateChat = async (req, res) => {
  const { chatId } = req.params;
  const { prompt } = req.body;

  try {
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const result = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const newResponse =
      result.data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ Gemini.";

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { prompt, response: newResponse },
      { new: true, runValidators: true }
    );

    if (!updatedChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json(updatedChat);
  } catch (err) {
    console.error("Update chat error:", err.response?.data || err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Xoá chat theo ID
const deleteChat = async (req, res) => {
  const { chatId } = req.params;

  try {
    const deleted = await Chat.findByIdAndDelete(chatId);

    if (!deleted) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Delete chat error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getChatHistoryById,
  updateChat,
  deleteChat,
};

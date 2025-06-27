const express = require("express");
const router = express.Router();
const {
  getChatHistory,
  getChatHistoryById,
  sendMessage,
  updateChat,
  deleteChat,
} = require("../controllers/textChat.controller");

router.get("/history", getChatHistory);
router.get("/history/:id", getChatHistoryById);
router.post("/chat", sendMessage);
router.put("/:chatId", updateChat);
router.delete("/:chatId", deleteChat);


module.exports = router;

// controllers/textChat.controller.js
const OpenAI = require('openai');

// Khởi tạo OpenAI với API Key từ biến môi trường
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// GET: Lấy lịch sử chat (tạm thời trả mảng rỗng)
const getChatHistory = async (req, res) => {
  return res.json([]); // Có thể thay bằng truy vấn từ DB sau
};

// POST: Gửi prompt từ người dùng tới OpenAI và trả kết quả
const sendPromptToAI = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt in request body' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    const result = completion.choices[0].message.content;

    return res.json({
      id: Date.now().toString(), // tạm thời dùng timestamp làm id
      result,
    });
  } catch (error) {
    console.error('OpenAI error:', error.message);
    return res.status(500).json({ error: 'AI response failed.' });
  }
};

module.exports = {
  getChatHistory,
  sendPromptToAI,
};

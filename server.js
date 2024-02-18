
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // 引入cors
const app = express();

app.use(cors()); // 使用cors中间件
app.use(express.json());

// ... 其余代码保持不变 ...

app.use(express.json());



app.post('/process-text', async (req, res) => {
    const userText = req.body.text;
    const prompt = `你好我正在学习荷兰语，这是我写的稿子：${userText}。我不会的地方都用其他语言进行表达了。请你修改错误的部分，不需要过度润色。务必保证返回的全文都是荷兰文。如果输入全部正确则原文返回。`;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{"role": "system", "content": prompt}],
            temperature: 0.5
        }, {
            headers: {
                'Authorization': `Bearer YOUR_OWN_GPT_API_KEY`,
                'Content-Type': 'application/json'
            }
        });

        const correctedText = response.data.choices[0].message.content;
        res.json({ correctedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


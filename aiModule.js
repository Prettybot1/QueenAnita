const axios = require('axios');
const config = require('./config/config.json');

async function getAIResponse(message, userData) {
    try {
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: "gpt-4",
            prompt: `User: ${message}\nAssistant:`,
            max_tokens: 150,
            temperature: 0.7,
        }, {
            headers: { Authorization: `Bearer ${config.openaiApiKey}` }
        });
        
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error("Error fetching AI response:", error);
        return "I'm having trouble thinking right now, please try again later!";
    }
}

module.exports = { getAIResponse };

const express = require('express');
const axios = require('axios');
const { OPENAI_API_KEY, OPENAI_API_URL } = require('../constants');


app.post('/tell-joke', async (req, res) => {
    try {
        console.log(OPENAI_API_URL);
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: "Tell a joke and respond in JSON format with fields 'setup' and 'punchline'" }],
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const joke = JSON.parse(response.data.choices[0].message.content);
        res.json(joke);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while fetching the joke', error });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

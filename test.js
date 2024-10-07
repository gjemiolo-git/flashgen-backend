const axios = require('axios');
require('dotenv').config();

//const OPENAI_API_KEY = 'sk-9ZB7gXNBhuoV02G3Zu_uex1ceAOllZP3e23TpUYw_ZT3BlbkFJV1nUKd1uadH4lGDnGmsjTBEZJUuPBD1a4oAPSTTukA'
const OPENAI_API_KEY = process.env.OPENAI_API_KEYY
const OPENAI_API_URL = process.env.OPENAI_API_URL

async function getJokeFromOpenAI() {
    try {
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: "Tell me a short joke" }],
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('OpenAI Response:', response.data);
        console.log('Joke:', response.data.choices[0].message.content);
    } catch (error) {
        console.log(error);
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

getJokeFromOpenAI();

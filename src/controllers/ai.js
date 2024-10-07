const axios = require('axios');
const { OPENAI_API_KEY, OPENAI_API_URL } = require('../constants');
const { sequelize } = require('../db');
const Flashcard = require('../db/models/Flashcard')(sequelize);
const FlashcardSet = require('../db/models/FlashcardSet')(sequelize);
const Topic = require('../db/models/Topic')(sequelize);
const User = require('../db/models/User')(sequelize);

exports.aiFetch = async (req, res) => {
    const { topic, number } = req.body;
    const userId = 1;

    if (!topic || !number) {
        return res.status(400).json({ error: 'Both topic and number must be provided in the specification' });
    }

    try {
        console.log('Loading flashcards... [Qurying AI]')
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: "gpt-4o-mini",
                messages: [{
                    role: "user",
                    content: `Generate ${number} flashcards on the topic of ${topic}. Focus on key aspects of the topic, relationship between them, and choose ${number} most interesting ones.
                    Provide the output as a single JSON array containing ${number} objects. Each object should have two properties: 'frontContent' for the question or phrase, and 'backContent' for the answer. Here's an example of the expected format for a single object:
                    [
                    {
                        'frontContent': 'question / phrase',
                        'backContent': 'answer'
                    },
                    ]
                    Ensure that the entire output is a valid JSON array containing exactly ${number} such objects, that can be parsed. Do not include backticks, or any other characters`
                }],
                temperature: 0.7
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const flashcards = JSON.parse(response.data.choices[0].message.content);
        console.log('Saving flashcards...');
        const savedFlashcardSet = await saveFlashcards(flashcards, userId, topic);
        res.status(200).json(savedFlashcardSet);
    } catch (error) {
        console.error('Full error object:', error);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response ? error.response.data : 'No response data');
        res.status(500).json({ error: 'An error occurred while fetching the flashcards', details: error.message });
    }
};

async function saveFlashcards(flashcardsArray, userId, topicName) {
    try {
        // const flashcardsArray = [
        //     {
        //         frontContent: 'What unique adaptation do Arctic foxes have for surviving in extreme cold?',
        //         backContent: 'Arctic foxes have a thick, insulating fur coat that changes color with the seasons, providing camouflage and warmth.'
        //     },
        //     {
        //         frontContent: 'How do bees communicate with each other?',
        //         backContent: 'Bees communicate through a series of dances, specifically the waggle dance, which conveys information about the location of food sources.'
        //     },
        //     {
        //         frontContent: 'What is the symbiotic relationship between clownfish and sea anemones?',
        //         backContent: 'Clownfish are protected from predators by the stinging tentacles of sea anemones, while they provide the anemones with nutrients and help keep them clean.'
        //     }
        // ];
        console.log('Saving flashcards... [Creating Set]');
        const flashcardSet = await FlashcardSet.create({
            createdBy: userId,
            name: `Flashcard Set - ${topicName} - ${new Date().toISOString()}`
        });

        console.log('Saving flashcards... [Adding Topic]');
        const [topic, created] = await Topic.findOrCreate({
            where: { name: topicName },
            defaults: { created_by: userId }
        });

        console.log('Saving flashcards... [Associating Topic with Set]');
        await flashcardSet.addTopic(topic);

        const savedCards = [];
        console.log('Saving flashcards... [Adding flashcards]');
        for (const flashcard of flashcardsArray) {
            const { frontContent, backContent } = flashcard;
            const card = await Flashcard.create({
                frontContent,
                backContent,
                setId: flashcardSet.id
            });
            await card.addTopic(topic);
            savedCards.push(card);
        }

        console.log(`Successfully saved ${savedCards.length} flashcards in set ${flashcardSet.id}.`);

        const completeSet = await FlashcardSet.findByPk(flashcardSet.id, {
            include: [
                { model: Flashcard, as: 'flashcards', include: [{ model: Topic, as: 'topics' }] },
                { model: Topic, as: 'topics' }
            ]
        });

        return completeSet;
    } catch (error) {
        console.error('Error saving flashcards:', error);
        throw error;
    }
}



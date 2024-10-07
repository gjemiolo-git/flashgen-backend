const axios = require('axios');
const { OPENAI_API_KEY, OPENAI_API_URL } = require('../../constants');
const { sequelize } = require('../../db');
const Flashcard = require('../../db/models/Flashcard')(sequelize);
const FlashcardSet = require('../../db/models/FlashcardSet')(sequelize);
const Topic = require('../../db/models/Topic')(sequelize);
//const User = require('../db/models/User')(sequelize);
const SPECIAL_CHAR_AVOIDANCE = `Do not utilize any other characters that couldn't be parsed into JSON, or any textfield formatting.`;

exports.handleError = (res, message, error) => {
    console.error(`${message}:`, error);
    res.status(500).json({ error: message, details: error.message });
};

exports.findOrCreateModel = async (Model, where, defaults) => {
    const [instance, created] = await Model.findOrCreate({ where, defaults });
    return instance;
};


exports.checkModelExists = async (Model, id, errorMessage) => {
    const instance = await Model.findByPk(id);
    if (!instance) {
        throw new Error(errorMessage);
    }
    return instance;
};

exports.associateTopicWithSet = async (flashcardSet, topic) => {
    await flashcardSet.addTopic(topic);
}

exports.createFlashcardWithTopic = async (frontContent, backContent, setId, topic) => {
    const card = await Flashcard.create({
        frontContent,
        backContent,
        setId
    });
    await card.addTopic(topic);
    return card;
}

exports.fetchFlashcardsFromAI = async (topic, number, existingFlashcards) => {
    const response = await axios.post(
        OPENAI_API_URL,
        {
            model: "gpt-4o-mini",
            messages: [{
                role: "user",
                content: `Generate ${number} new flashcards on the topic of ${topic}, distinct from the following existing flashcards:
                ${JSON.stringify(existingFlashcards)}
                Focus on key aspects of the topic, relationships between them, and choose ${number} most interesting ones.
                Provide the output as a single JSON array containing ${number} most interesting objects. Each object should have two properties: 'frontContent' for the question or phrase, and 'backContent' for the answer. Ensure the entire output is a valid JSON array.
                ${SPECIAL_CHAR_AVOIDANCE}
                `
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
    return JSON.parse(response.data.choices[0].message.content);
}


exports.saveFlashcards = async (flashcardsArray, userId, topicName) => {
    try {
        const flashcardSet = await FlashcardSet.create({
            createdBy: userId,
            name: `Flashcard Set - ${topicName} - ${new Date().toISOString()}`
        });

        const topic = await findOrCreateModel(Topic, { name: topicName }, { created_by: userId });
        await flashcardSet.addTopic(topic);

        const savedCards = await Promise.all(flashcardsArray.map(({ frontContent, backContent }) =>
            createFlashcardWithTopic(frontContent, backContent, flashcardSet.id, topic)
        ));

        console.log(`Successfully saved ${savedCards.length} flashcards in set ${flashcardSet.id}.`);

        return FlashcardSet.findByPk(flashcardSet.id, {
            include: [
                { model: Flashcard, as: 'flashcards', include: [{ model: Topic, as: 'topics' }] },
                { model: Topic, as: 'topics' }
            ]
        });
    } catch (error) {
        throw new Error(`Error saving flashcards: ${error.message}`);
    }
}
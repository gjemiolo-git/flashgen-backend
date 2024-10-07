

const axios = require('axios');
const { OPENAI_API_KEY, OPENAI_API_URL } = require('../../constants');
const { sequelize } = require('../../db');
const Flashcard = require('../../db/models/Flashcard')(sequelize);
const FlashcardSet = require('../../db/models/FlashcardSet')(sequelize);
const Topic = require('../../db/models/Topic')(sequelize);
const User = require('../../db/models/User')(sequelize);



exports.updateFlashcardSet = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, topicName } = req.body;

        const flashcardSet = await FlashcardSet.findByPk(id);
        if (!flashcardSet) {
            return res.status(404).json({ error: 'Flashcard set not found' });
        }

        flashcardSet.name = name;
        await flashcardSet.save();

        if (topicName) {
            const topic = await getOrCreateTopic(topicName, flashcardSet.createdBy);
            await associateTopicWithSet(flashcardSet, topic);
        }

        res.status(200).json(flashcardSet);
    } catch (error) {
        res.status(500).json({ error: 'Error updating flashcard set', details: error.message });
    }
};

exports.deleteFlashcardSet = async (req, res) => {
    try {
        const { id } = req.params;
        const flashcardSet = await FlashcardSet.findByPk(id);

        if (!flashcardSet) {
            return res.status(404).json({ error: 'Flashcard set not found' });
        }

        await flashcardSet.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting flashcard set', details: error.message });
    }
};

// Flashcard CRUD operations
exports.updateFlashcard = async (req, res) => {
    try {
        const { id } = req.params;
        const { frontContent, backContent, topicName } = req.body;

        const flashcard = await Flashcard.findByPk(id);
        if (!flashcard) {
            return res.status(404).json({ error: 'Flashcard not found' });
        }

        flashcard.frontContent = frontContent;
        flashcard.backContent = backContent;
        await flashcard.save();

        if (topicName) {
            const topic = await getOrCreateTopic(topicName, flashcard.FlashcardSet.createdBy);
            await flashcard.setTopics([topic]);
        }

        res.status(200).json(flashcard);
    } catch (error) {
        res.status(500).json({ error: 'Error updating flashcard', details: error.message });
    }
};




// exports.createFlashcardSet = async (req, res) => {
//     const { topic, number } = req.body;

//     const userId = req.user.id;

//     if (!topic || !number) {
//         return res.status(400).json({ error: 'Both topic and number must be provided' });
//     }

//     try {
//         const flashcards = await fetchFlashcardsFromAI(topic, number, []);
//         const savedFlashcardSet = await saveFlashcards(flashcards, userId, topic);
//         res.status(200).json(savedFlashcardSet);
//     } catch (error) {
//         handleError(res, 'Error creating flashcard set', error);
//     }
// };

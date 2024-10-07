const axios = require('axios');
const { OPENAI_API_KEY, OPENAI_API_URL } = require('../constants');
const { sequelize } = require('../db');
const Flashcard = require('../db/models/Flashcard')(sequelize);
const FlashcardSet = require('../db/models/FlashcardSet')(sequelize);
const Topic = require('../db/models/Topic')(sequelize);
const User = require('../db/models/User')(sequelize);
const SPECIAL_CHAR_AVOIDANCE = `Do not utilize any other characters that couldn't be parsed into JSON, or any textfield formatting.`;

const handleError = (res, message, error) => {
    console.error(`${message}:`, error);
    res.status(500).json({ error: message, details: error.message });
};

const findOrCreateModel = async (Model, where, defaults) => {
    const [instance, created] = await Model.findOrCreate({ where, defaults });
    return instance;
};


const checkModelExists = async (Model, id, errorMessage) => {
    const instance = await Model.findByPk(id);
    if (!instance) {
        throw new Error(errorMessage);
    }
    return instance;
};

async function associateTopicWithSet(flashcardSet, topic) {
    await flashcardSet.addTopic(topic);
}

async function createFlashcardWithTopic(frontContent, backContent, setId, topic) {
    const card = await Flashcard.create({
        frontContent,
        backContent,
        setId
    });
    await card.addTopic(topic);
    return card;
}

async function fetchFlashcardsFromAI(topic, number, existingFlashcards) {
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

async function saveFlashcards(flashcardsArray, userId, topicName) {
    try {
        const flashcardSet = await FlashcardSet.create({
            createdBy: userId,
            name: `Flashcard Set - ${topicName} - ${new Date().toISOString()}`
        });

        const [topic, created] = await Topic.findOrCreate({
            where: { name: topicName },
            defaults: { created_by: userId }  // Use created_by instead of createdBy
        });
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

async function getUserFlashcardSets(userId, page = 1, limit = 5) {
    try {
        //console.log(`Fetching flashcard sets for user ID: ${userId}, page: ${page}, limit: ${limit}`);

        const offset = (page - 1) * limit;

        const { count, rows: flashcardSets } = await FlashcardSet.findAndCountAll({
            where: { createdBy: userId },
            attributes: [
                'id',
                'name',
            ],
            include: [
                {
                    model: Flashcard,
                    as: 'flashcards',
                    attributes: [],
                    required: false
                }
            ],
            group: ['FlashcardSet.id'],
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            distinct: true,
            subQuery: false
        });

        const formattedFlashcardSets = await Promise.all(flashcardSets.map(async (set) => {
            const cardCount = await Flashcard.count({ where: { setId: set.id } });
            return {
                id: set.id,
                name: set.name,
                cardCount: cardCount
            };
        }));

        const totalCount = count.length;
        const totalPages = Math.ceil(totalCount / limit);

        //console.log(`Found ${totalCount} total flashcard sets, returning ${formattedFlashcardSets.length} for page ${page}`);

        return {
            flashcardSets: formattedFlashcardSets,
            totalCount: totalCount,
            currentPage: page,
            totalPages: totalPages
        };
    } catch (error) {
        console.error('Error fetching user flashcard sets:', error);
        throw error;
    }
}

exports.getUserFlashcardSets = async (req, res) => {
    try {
        const userId = 1;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const result = await getUserFlashcardSets(userId, page, limit);
        res.json(result);
    } catch (error) {
        console.error('Error in dashboard route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.correctFlashcardSet = async (req, res) => {
    try {
        const { id } = req.params;
        const { correction } = req.body;

        if (!correction) {
            return res.status(400).json({ error: 'Correction instruction must be provided' });
        }

        const updatedSet = await updateFlashcardSet(id, correction);
        res.status(200).json(updatedSet);
    } catch (error) {
        res.status(500).json({ error: 'Error correcting flashcard set', details: error.message });
    }
};

exports.addFlashcards = async (setId, number, userId) => {
    try {
        const flashcardSet = await FlashcardSet.findByPk(setId, {
            include: [
                { model: Flashcard, as: 'flashcards' },
                { model: Topic, as: 'topics' }
            ]
        });

        if (!flashcardSet) {
            throw new Error('Flashcard set not found');
        }

        const existingFlashcards = flashcardSet.flashcards.map(card => ({
            frontContent: card.frontContent,
            backContent: card.backContent
        }));

        const topic = flashcardSet.topics[0];
        const newFlashcards = await fetchFlashcardsFromAI(topic.name, number, existingFlashcards);

        const savedCards = [];
        for (const flashcard of newFlashcards) {
            const { frontContent, backContent } = flashcard;
            const card = await createFlashcardWithTopic(frontContent, backContent, setId, topic);
            savedCards.push(card);
        }

        console.log(`Successfully added ${savedCards.length} new flashcards to set ${setId}.`);

        return flashcardSet;
    } catch (error) {
        console.error('Error adding flashcards:', error);
        throw error;
    }
}


exports.createFlashcardSet = async (req, res) => {
    const { topic, number } = req.body;
    const userId = 1; // Assuming user authentication is implemented

    if (!topic || !number) {
        return res.status(400).json({ error: 'Both topic and number must be provided in the specification' });
    }

    try {
        console.log('Loading flashcards... [Querying AI]');
        const flashcards = await fetchFlashcardsFromAI(topic, number, []);
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

async function updateFlashcardSet(setId, correction) {
    try {
        const flashcardSet = await FlashcardSet.findByPk(setId, {
            include: [
                { model: Flashcard, as: 'flashcards' },
                { model: Topic, as: 'topics' }
            ]
        });

        if (!flashcardSet) {
            throw new Error('Flashcard set not found');
        }

        const existingFlashcards = flashcardSet.flashcards.map(card => ({
            frontContent: card.frontContent,
            backContent: card.backContent
        }));

        const correctedFlashcards = await correctFlashcardsWithAI(existingFlashcards, correction);

        for (let i = 0; i < flashcardSet.flashcards.length; i++) {
            const flashcard = flashcardSet.flashcards[i];
            const correctedCard = correctedFlashcards[i];

            flashcard.frontContent = correctedCard.frontContent;
            flashcard.backContent = correctedCard.backContent;
            await flashcard.save();
        }

        const updatedFlashcardSet = await FlashcardSet.findByPk(setId, {
            include: [
                { model: Flashcard, as: 'flashcards' },
                { model: Topic, as: 'topics' }
            ]
        });

        return updatedFlashcardSet;
    } catch (error) {
        console.error('Error updating flashcard set:', error);
        throw error;
    }
}

async function correctFlashcardsWithAI(flashcards, correction) {
    try {
        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: "gpt-4o-mini",
                messages: [{
                    role: "user",
                    content: `Given the following flashcards:
                    ${JSON.stringify(flashcards)}
                    Please correct and improve these flashcards based on this instruction: "${correction}"
                    Provide the output as a JSON array of objects, each with 'frontContent' and 'backContent'.
                    Ensure the entire output is valid JSON and maintains the same number of flashcards.\n ${SPECIAL_CHAR_AVOIDANCE}`
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
    } catch (error) {
        console.error('Error correcting flashcards with AI:', error);
        throw error;
    }
}

// FLASHCARD
exports.createFlashcard = async (req, res) => {
    try {
        const { setId, frontContent, backContent, topicName } = req.body;

        const flashcardSet = await FlashcardSet.findByPk(setId);
        if (!flashcardSet) {
            return res.status(404).json({ error: 'Flashcard set not found' });
        }

        const topic = await getOrCreateTopic(topicName, flashcardSet.createdBy);

        const flashcard = await createFlashcardWithTopic(frontContent, backContent, setId, topic);

        res.status(201).json(flashcard);
    } catch (error) {
        res.status(500).json({ error: 'Error creating flashcard', details: error.message });
    }
};

exports.getFlashcard = async (req, res) => {
    try {
        const { id } = req.params;
        const flashcard = await Flashcard.findByPk(id, {
            include: [{ model: Topic, as: 'topics' }]
        });

        if (!flashcard) {
            return res.status(404).json({ error: 'Flashcard not found' });
        }

        res.status(200).json(flashcard);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching flashcard', details: error.message });
    }
};

exports.deleteFlashcard = async (req, res) => {
    try {
        const { id } = req.params;
        const flashcard = await Flashcard.findByPk(id);

        if (!flashcard) {
            return res.status(404).json({ error: 'Flashcard not found' });
        }

        await flashcard.destroy();
        res.status(200).json({ success: true, message: "Flashcard removed successfully" });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting flashcard', details: error.message });
    }
};



/// FLASHCARD SET
exports.getFlashcardSet = async (req, res) => {
    try {
        const { id } = req.params;
        const flashcardSet = await FlashcardSet.findByPk(id, {
            include: [
                { model: Flashcard, as: 'flashcards', include: [{ model: Topic, as: 'topics' }] },
                { model: Topic, as: 'topics' }
            ]
        });

        if (!flashcardSet) {
            return res.status(404).json({ error: 'Flashcard set not found' });
        }

        res.status(200).json(flashcardSet);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching flashcard set', details: error.message });
    }
};

exports.deleteFlashcardSet = async (req, res) => {
    try {
        const { id } = req.params;
        const flashcardSet = await FlashcardSet.findByPk(id);

        if (!flashcardSet) {
            return res.status(404).json({ error: 'Flashcard set not found' });
        }

        await sequelize.transaction(async (t) => {
            await Flashcard.destroy({ where: { setId: id }, transaction: t });
            await flashcardSet.destroy({ transaction: t });
        });

        res.status(200).json({ success: true, message: "Set and associated flashcards removed successfully" });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting flashcard set', details: error.message });
    }
};



/// TOPIC
exports.getTopic = async (req, res) => {
    try {
        const topic = await checkModelExists(Topic, req.params.id, 'Topic not found');
        const topicWithRelations = await Topic.findByPk(topic.id, {
            include: [
                { model: Topic, as: 'parent' },
                { model: Topic, as: 'children' },
                { model: FlashcardSet, through: 'FlashcardSetTopics' }
            ]
        });
        res.status(200).json(topicWithRelations);
    } catch (error) {
        handleError(res, 'Error fetching topic', error);
    }
};


exports.createTopic = async (req, res) => {
    try {
        const { name, parentId } = req.body;
        const userId = req.user.id;

        if (parentId) {
            await checkModelExists(Topic, parentId, 'Parent topic not found');
        }

        const topic = await Topic.create({
            name,
            parent_id: parentId,
            created_by: userId
        });

        res.status(201).json(topic);
    } catch (error) {
        handleError(res, 'Error creating topic', error);
    }
};


exports.updateTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parentId } = req.body;

        const topic = await Topic.findByPk(id);
        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }

        if (parentId) {
            if (parentId === id) {
                return res.status(400).json({ error: 'A topic cannot be its own parent' });
            }
            const parentTopic = await Topic.findByPk(parentId);
            if (!parentTopic) {
                return res.status(400).json({ error: 'Parent topic not found' });
            }
            let currentParent = parentTopic;
            while (currentParent) {
                if (currentParent.id === id) {
                    return res.status(400).json({ error: 'Circular reference detected' });
                }
                currentParent = await Topic.findByPk(currentParent.parent_id);
            }
        }

        topic.name = name;
        topic.parent_id = parentId;
        await topic.save();

        res.status(200).json(topic);
    } catch (error) {
        res.status(500).json({ error: 'Error updating topic', details: error.message });
    }
};

exports.deleteTopic = async (req, res) => {
    try {
        const { id } = req.params;
        const topic = await Topic.findByPk(id, {
            include: [{ model: Topic, as: 'children' }]
        });

        if (!topic) {
            return res.status(404).json({ error: 'Topic not found' });
        }
        if (topic.children && topic.children.length > 0) {
            await Topic.destroy({ where: { parent_id: id } });
        }

        await topic.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Error deleting topic', details: error.message });
    }
};
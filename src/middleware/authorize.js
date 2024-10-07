const checkOwnership = (type) => async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        let item;
        if (type === 'flashcardSet') {
            item = await FlashcardSet.findByPk(id);
            if (!item) {
                return res.status(404).json({ error: 'Flashcard set not found' });
            }
            if (item.createdBy !== userId) {
                return res.status(403).json({ error: 'Forbidden: You are not the creator of this flashcard set' });
            }
        } else if (type === 'flashcard') {
            item = await Flashcard.findByPk(id, {
                include: [{
                    model: FlashcardSet,
                    as: 'set',
                    attributes: ['id', 'createdBy']
                }]
            });
            if (!item) {
                return res.status(404).json({ error: 'Flashcard not found' });
            }
            if (item.set.createdBy !== userId) {
                return res.status(403).json({ error: 'Forbidden: You are not the owner of this flashcard set' });
            }
        } else {
            return res.status(400).json({ error: 'Invalid type specified' });
        }

        // If the user is the owner, attach the item to the request object
        req[type] = item;
        next();
    } catch (error) {
        res.status(500).json({ error: `Error checking ${type} ownership`, details: error.message });
    }
};

const { Router } = require('express');
const router = Router({ mergeParams: true });
const { wrapAsync } = require('../utils/wrapAsync');
const aiController = require('../controllers/ai');
const { authenticateJWT, publicAuthenticateJWT } = require('../middleware/auth');

// General
router.post('/flashcards', authenticateJWT, aiController.fetchNewFlashcards);

// Flashcard Set routes
router.get('/flashcard-sets/:id', publicAuthenticateJWT, aiController.getFlashcardSet);
router.get('/dashboard/flashcard-sets', authenticateJWT, aiController.getUserFlashcardSets);
router.post('/flashcard-sets', authenticateJWT, aiController.createFlashcardSetWithFlashcards);
router.put('/flashcard-sets/:id/update', authenticateJWT, aiController.updateFlashcardSet);
router.put('/flashcard-sets/:id/update', aiController.correctFlashcardSet);
router.delete('/flashcard-sets/:id', authenticateJWT, aiController.deleteFlashcardSet);

// Topic routes
router.post('/topics', authenticateJWT, aiController.createTopic);
router.get('/topics/:id', aiController.getTopic);
router.get('/topics', publicAuthenticateJWT, aiController.getTopics);
router.get('/topics-dashboard/:id', publicAuthenticateJWT, aiController.getTopicDashboard);
router.delete('/topics/:id', authenticateJWT, aiController.deleteTopic);

/// Flashcard routes

router.get('/flashcards/:id', aiController.getFlashcard);

module.exports = router;
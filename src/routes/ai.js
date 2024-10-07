const { Router } = require('express');
const router = Router({ mergeParams: true });
const { wrapAsync, wrapAsyncGen } = require('../utils/wrapAsync');
const aiController = require('../controllers/ai');
const { registerValidation, loginValidation } = require('../validators/auth');
const { checkOwnership } = require('../middleware/authorize');
const { validationMiddleware, authenticateJWT, publicAuthenticateJWT } = require('../middleware/auth');

//checkOwnership('flashcardSet')/

// General
router.get('/dashboard/flashcard-sets', aiController.getUserFlashcardSets);
router.post('/add-cards', aiController.addFlashcards);
router.put('/flashcard-sets/:id/correct', aiController.correctFlashcardSet);

// Flashcard Set routes
router.post('/flashcard-sets', aiController.createFlashcardSet);
router.get('/flashcard-sets/:id', aiController.getFlashcardSet);
router.delete('/flashcard-sets/:id', aiController.deleteFlashcardSet);
// router.put('/flashcard-sets/:id', authenticateJWT, aiController.updateFlashcardSet);


// Topic routes
router.post('/topics', authenticateJWT, aiController.createTopic);
router.get('/topics/:id', aiController.getTopic);
router.get('/topics', publicAuthenticateJWT, aiController.getTopics);
router.delete('/topics/:id', aiController.deleteTopic);
// router.put('/topics/:id', authenticateJWT, aiController.updateTopic);

/// Flashcard routes
router.post('/flashcards', aiController.createFlashcard);
router.get('/flashcards/:id', aiController.getFlashcard);
router.delete('/flashcards/:id', aiController.deleteFlashcard);
// router.put('/flashcards/:id', authenticateJWT, aiController.updateFlashcard);

module.exports = router;
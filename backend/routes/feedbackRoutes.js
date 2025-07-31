const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getAllFeedback);
router.delete('/:id', feedbackController.deleteFeedback);
router.post('/:id/reply', feedbackController.replyFeedback);
router.get('/download', feedbackController.downloadFeedback);

module.exports = router;
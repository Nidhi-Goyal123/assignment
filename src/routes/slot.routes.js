
const express = require('express');
const router = express.Router();

const slotController = require('../controller/slot.controller');
const { authenticateUser, authorizeRole } = require('../middleware/auth.middleware');

// POST /slots - Recruiter creates a slot
router.post(
    '/',
    authenticateUser,
    authorizeRole('recruiter'),
    slotController.createSlot
);

// GET /slots - Recruiter or candidate views slots
router.get(
    '/',
    authenticateUser,
    slotController.getSlots
);

// POST /slots/:id/book - Candidate books a slot
router.post(
    '/:id/book',
    authenticateUser,
    authorizeRole('candidate'),
    slotController.bookSlot
);

// POST /slots/:id/cancel - Recruiter or candidate cancels a slot
router.post(
    '/:id/cancel',
    authenticateUser,
    slotController.cancelSlot
);

module.exports = router;

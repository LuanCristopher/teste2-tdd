const express = require('express');
const router = express.Router();
const db = require('./database');
const { validateParticipant } = require('./validation');

router.post('/register', (req, res) => {
  const { name, email, eventId } = req.body;

  const validation = validateParticipant({ name, email });
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  if (!eventId) {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  try {
    const participantStmt = db.prepare('INSERT INTO participants (name, email) VALUES (?, ?)');
    const participantInfo = participantStmt.run(name, email);
    const participantId = participantInfo.lastInsertRowid;

    const registrationStmt = db.prepare('INSERT INTO registrations (participant_id, event_id) VALUES (?, ?)');
    registrationStmt.run(participantId, eventId);

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/checkin', (req, res) => {
  const { participantId, eventId } = req.body;

  if (!participantId || !eventId) {
    return res.status(400).json({ message: 'Participant ID and Event ID are required' });
  }

  const registrationStmt = db.prepare('SELECT * FROM registrations WHERE participant_id = ? AND event_id = ?');
  const registration = registrationStmt.get(participantId, eventId);

  if (!registration) {
    return res.status(404).json({ message: 'Participant not registered for this event' });
  }

  if (registration.checked_in_at) {
    return res.status(409).json({ message: 'Participant already checked in' });
  }

  const now = new Date().toISOString();
  const updateStmt = db.prepare('UPDATE registrations SET checked_in_at = ? WHERE id = ?');
  updateStmt.run(now, registration.id);

  res.status(200).json({ message: 'Check-in successful' });
});

router.delete('/register/:registrationId', (req, res) => {
  const { registrationId } = req.params;

  const updateStmt = db.prepare("UPDATE registrations SET status = 'canceled' WHERE id = ?");
  const info = updateStmt.run(registrationId);

  if (info.changes === 0) {
    return res.status(404).json({ message: 'Registration not found' });
  }

  res.status(200).json({ message: 'Registration canceled' });
});

router.get('/participants/:id/events', (req, res) => {
  const { id } = req.params;

  const stmt = db.prepare(`
    SELECT e.*
    FROM events e
    JOIN registrations r ON e.id = r.event_id
    WHERE r.participant_id = ? AND r.status = 'active'
  `);
  const events = stmt.all(id);

  res.status(200).json(events);
});

module.exports = router;

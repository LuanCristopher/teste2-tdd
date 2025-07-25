const request = require('supertest');
const app = require('../../src/server');
const db = require('../../src/database');

describe('POST /register', () => {
  beforeEach(() => {
    db.exec('DELETE FROM registrations');
    db.exec('DELETE FROM participants');
    db.exec('DELETE FROM events');
  });

  it('should register a participant for an event', async () => {
    const event = { name: 'Test Event', date: '2025-12-31' };
    const eventStmt = db.prepare('INSERT INTO events (name, date) VALUES (?, ?)');
    const eventInfo = eventStmt.run(event.name, event.date);
    const eventId = eventInfo.lastInsertRowid;

    const participant = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      eventId,
    };

    const res = await request(app)
      .post('/register')
      .send(participant);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Registration successful');
  });
});

describe('POST /checkin', () => {
  beforeEach(() => {
    db.exec('DELETE FROM registrations');
    db.exec('DELETE FROM participants');
    db.exec('DELETE FROM events');
  });

  it('should check in a participant for an event', async () => {
    const event = { name: 'Test Event', date: '2025-12-31' };
    const eventStmt = db.prepare('INSERT INTO events (name, date) VALUES (?, ?)');
    const eventInfo = eventStmt.run(event.name, event.date);
    const eventId = eventInfo.lastInsertRowid;

    const participant = { name: 'John Doe', email: 'john.doe@example.com' };
    const participantStmt = db.prepare('INSERT INTO participants (name, email) VALUES (?, ?)');
    const participantInfo = participantStmt.run(participant.name, participant.email);
    const participantId = participantInfo.lastInsertRowid;

    const registrationStmt = db.prepare('INSERT INTO registrations (participant_id, event_id) VALUES (?, ?)');
    registrationStmt.run(participantId, eventId);

    const res = await request(app)
      .post('/checkin')
      .send({ participantId, eventId });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Check-in successful');
  });

  it('should not check in a participant that is not registered for the event', async () => {
    const res = await request(app)
      .post('/checkin')
      .send({ participantId: 1, eventId: 1 });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Participant not registered for this event');
  });
});

describe('DELETE /register/:registrationId', () => {
  beforeEach(() => {
    db.exec('DELETE FROM registrations');
    db.exec('DELETE FROM participants');
    db.exec('DELETE FROM events');
  });

  it('should cancel a registration', async () => {
    const event = { name: 'Test Event', date: '2025-12-31' };
    const eventStmt = db.prepare('INSERT INTO events (name, date) VALUES (?, ?)');
    const eventInfo = eventStmt.run(event.name, event.date);
    const eventId = eventInfo.lastInsertRowid;

    const participant = { name: 'John Doe', email: 'john.doe@example.com' };
    const participantStmt = db.prepare('INSERT INTO participants (name, email) VALUES (?, ?)');
    const participantInfo = participantStmt.run(participant.name, participant.email);
    const participantId = participantInfo.lastInsertRowid;

    const registrationStmt = db.prepare('INSERT INTO registrations (participant_id, event_id) VALUES (?, ?)');
    const registrationInfo = registrationStmt.run(participantId, eventId);
    const registrationId = registrationInfo.lastInsertRowid;

    const res = await request(app)
      .delete(`/register/${registrationId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Registration canceled');
  });
});

describe('GET /participants/:id/events', () => {
  beforeEach(() => {
    db.exec('DELETE FROM registrations');
    db.exec('DELETE FROM participants');
    db.exec('DELETE FROM events');
  });

  it('should list all events for a participant', async () => {
    const event1 = { name: 'Test Event 1', date: '2025-12-31' };
    const event2 = { name: 'Test Event 2', date: '2026-01-01' };
    const eventStmt = db.prepare('INSERT INTO events (name, date) VALUES (?, ?)');
    const eventInfo1 = eventStmt.run(event1.name, event1.date);
    const eventId1 = eventInfo1.lastInsertRowid;
    const eventInfo2 = eventStmt.run(event2.name, event2.date);
    const eventId2 = eventInfo2.lastInsertRowid;

    const participant = { name: 'John Doe', email: 'john.doe@example.com' };
    const participantStmt = db.prepare('INSERT INTO participants (name, email) VALUES (?, ?)');
    const participantInfo = participantStmt.run(participant.name, participant.email);
    const participantId = participantInfo.lastInsertRowid;

    const registrationStmt = db.prepare('INSERT INTO registrations (participant_id, event_id) VALUES (?, ?)');
    registrationStmt.run(participantId, eventId1);
    registrationStmt.run(participantId, eventId2);

    const res = await request(app)
      .get(`/participants/${participantId}/events`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveLength(2);
  });
});

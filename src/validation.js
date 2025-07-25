function validateParticipant(data) {
  const { name, email } = data;
  if (!name || !email) {
    return { valid: false, message: 'Name and email are required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }

  return { valid: true };
}

module.exports = {
  validateParticipant,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.validateEmail = (email) => {
  if (!email) return { valid: false, message: 'Email is required' };
  if (typeof email !== 'string') return { valid: false, message: 'Email must be a string' };
  if (email.length > 100) return { valid: false, message: 'Email too long (max 100 chars)' };
  if (!emailRegex.test(email)) return { valid: false, message: 'Invalid email format' };
  return { valid: true };
};
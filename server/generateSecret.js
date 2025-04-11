const crypto = require('crypto');

// Generate a random 64-byte string
const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

const newSecret = generateSecret();
console.log('New session secret:');
console.log(newSecret);
console.log('\nCopy this value to your .env file as SESSION_SECRET='); 
// Import the bcrypt library.
const bcrypt = require('bcryptjs');

// The password to be hashed.
const password = 'Lambert123';

// The salt rounds determine the computational cost of hashing.
// A higher number means more time is needed, which makes brute-force attacks harder.
// A value of 10 is a good starting point.
const saltRounds = 10;

// Use bcrypt.hash() to generate the hash.
// The function is asynchronous, so we use async/await or a Promise chain.
async function hashPassword() {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

// Call the async function to start the process.
hashPassword();

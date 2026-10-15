

import jwt from 'jsonwebtoken';

// This helper creates a JWT for a logged-in customer.
// The payload is the user id, and the server signs it with a secret key so it
// cannot be altered on the client and later trusted automatically.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

export default generateToken;

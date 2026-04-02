import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path: './backend/.env' });

const userId = process.argv[2];
if (!userId) {
  console.error('Usage: node scripts/generateToken.js <userId>');
  process.exit(1);
}

const token = jwt.sign({ id: userId, role: 'parent' }, process.env.JWT_SECRET, { expiresIn: '7d' });
console.log(token);

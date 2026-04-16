import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If we only have 1 default user seeded and no frontend login, we could fall back to ID 1 for testing.
    // For a real production app we would enforce this strictly.
    // To allow the original "no-login" logic to gracefully expire, let's enforce token.
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_secure_123');
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

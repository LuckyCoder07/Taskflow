// ─── middleware/auth.js ────────────────────────────────────────────────────────
// Verifies the JWT on every protected route.
// Usage: router.get('/tasks', auth, handler)
// Client must send:  Authorization: Bearer <token>

const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  const token  = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) return res.status(401).json({ message: 'No token — access denied' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, iat, exp }
    next();
  } catch {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

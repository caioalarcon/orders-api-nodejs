const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/jwt');

async function login(req, res, next) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username e password são obrigatórios' });
    }

    // Autenticação simplificada apenas para o desafio.
    if (username !== 'admin' || password !== 'admin') {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ sub: username }, jwtSecret, { expiresIn: jwtExpiresIn });

    return res.status(200).json({ token, tokenType: 'Bearer', expiresIn: jwtExpiresIn });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
};

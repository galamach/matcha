const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
  console.log('verifyToken')
  const token = req.headers['authorization']
  if (!token) {
    return res.status(401).json({
      auth: false,
      message: 'No token provided.'
    })
  }
  jwt.verify(token, process.env.JWTSECRET, function(err, decoded) {
    if (err) {
      return res.status(500).send({
        auth: false,
        message: 'Failed to authenticate token.'
      })
    }
    req.user = decoded
    console.log('verifyToken OK')
    next();
  })
}

module.exports = verifyToken
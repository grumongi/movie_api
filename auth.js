const jwtSecret = 'your_jwt_secret'; 
const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); 

// Generate JWT Token
let generateJWTToken = (user) => {
  return jwt.sign(
    { _id: user._id, Username: user.Username }, 
    jwtSecret,
    {
      subject: user.Username, 
      expiresIn: '7d', 
      algorithm: 'HS256' 
    }
  );
};

/* POST login */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Invalid username or password',
          user: null
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          return res.status(500).send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user: { _id: user._id, Username: user.Username }, token });
      });
    })(req, res);
  });
};

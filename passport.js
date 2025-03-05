const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const Models = require('./models.js');

const Users = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// ✅ Local Strategy for username/password authentication
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, callback) => {
      try {
        console.log(`Attempting login: ${username}`);

        const user = await Users.findOne({ Username: username });

        if (!user) {
          console.log('Incorrect username');
          return callback(null, false, { message: 'Incorrect username or password.' });
        }

        if (!user.validatePassword(password)) {
          console.log('Incorrect password');
          return callback(null, false, { message: 'Incorrect password.' });
        }

        console.log('Login successful');
        return callback(null, user);
      } catch (error) {
        console.error('Error during authentication:', error);
        return callback(error);
      }
    }
  )
);

// ✅ JWT Strategy for token-based authentication
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret',
    },
    async (jwtPayload, callback) => {
      try {
        const user = await Users.findById(jwtPayload._id);
        if (!user) {
          return callback(null, false, { message: 'User not found.' });
        }
        return callback(null, user);
      } catch (error) {
        console.error('Error in JWT authentication:', error);
        return callback(error);
      }
    }
  )
);

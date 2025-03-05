const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/myflixDB', { useNewUrlParser: true, useUnifiedTopology: true })
  
mongoose.connect( process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      uuid = require('uuid');

app.use(bodyParser.json());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const cors = require('cors');
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));


const { check, validationResult } = require('express-validator');



// ✅ CREATE a new user in the database
app.post('/users',  
    [  
      check('Username', 'Username is required').isLength({ min: 5 }),  
      check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),  
      check('Password', 'Password is required').not().isEmpty(),  
      check('Email', 'Email does not appear to be valid').isEmail()  
    ], async (req, res) => {  
  
      let errors = validationResult(req);  
  
      if (!errors.isEmpty()) {  
        return res.status(422).json({ errors: errors.array() });  
      }  
  
      let hashedPassword = Users.hashPassword(req.body.Password);  
      await Users.findOne({ Username: req.body.Username })  
        .then((user) => {  
          if (user) {  
            return res.status(400).send(req.body.Username + ' already exists');  
          } else {  
            Users  
              .create({  
                Username: req.body.Username,  
                Password: hashedPassword,  
                Email: req.body.Email,  
                Birthday: req.body.Birthday  
              })  
              .then((user) => { res.status(201).json(user) })  
              .catch((error) => {  
                console.error(error);  
                res.status(500).send('Error: ' + error);  
              });  
          }  
        })  
        .catch((error) => {  
          console.error(error);  
          res.status(500).send('Error: ' + error);  
        });  
    });  
  



// ✅ READ - Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await Users.find();
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});



// ✅ READ - Get a user by Username
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
        { new: true }) 
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error: ' + err);
        })
});



// ✅ UPDATE - Update a user's details
app.put('/users/:id', async (req, res) => {
    try {
        const updatedUser = await Users.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true } // Return updated document
        );

        if (updatedUser) {
            res.status(200).json(updatedUser);
        } else {
            res.status(400).send('No such user');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});



// ✅ UPDATE - Allow users to authenticate their user info (username)
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $set:
        {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
        }
    },
        { new: true }) 
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send('Error: ' + err);
        })
});



// ✅ DELETE - Remove a user by ID
app.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await Users.findByIdAndDelete(req.params.id);
        if (deletedUser) {
            res.status(200).send(`User ${req.params.id} has been deleted`);
        } else {
            res.status(400).send('No such user');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});



// ✅ ADD a movie to a user's favorite list
app.post('/users/:id/:movieId', async (req, res) => {
    try {
        const user = await Users.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { FavoriteMovies: req.params.movieId } },
            { new: true }
        );

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(400).send('No such user');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});



// ✅ REMOVE a movie from a user's favorite list
app.delete('/users/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if (req.user._id.toString() !== req.params.id) {
        return res.status(403).send('You can only delete your own account.');
    }

    try {
        const deletedUser = await Users.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(400).send('No such user');
        }
        res.status(200).send(`User ${req.params.id} has been deleted`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});



// ✅ READ - Get all movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });



// ✅ READ - Get a movie by title
app.get('/movies/:title', async (req, res) => {
    try {
        const movie = await Movies.findOne({ Title: req.params.title });
        if (movie) {
            res.status(200).json(movie);
        } else {
            res.status(400).send('No such movie');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});



// ✅ READ - Get movies by genre
app.get('/movies/genre/:genreName', async (req, res) => {
    try {
        const movies = await Movies.find({ 'Genre.Name': req.params.genreName });
        if (movies.length > 0) {
            res.status(200).json(movies);
        } else {
            res.status(400).send('No such genre');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});



// ✅ READ - Get movies by director
app.get('/movies/directors/:directorName', async (req, res) => {
    try {
        const movies = await Movies.find({ 'Director.Name': req.params.directorName });
        if (movies.length > 0) {
            res.status(200).json(movies);
        } else {
            res.status(400).send('No such director');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

app.get("/", (req, res) => {
    res.send("Welcome to the Cinema Center API!");
  });
  

// ✅ Server listens on port 8080
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

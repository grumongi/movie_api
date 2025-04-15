const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Movie Schema
const movieSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Genre: {
        Name: { type: String },
        Description: { type: String }
    },
    Director: {
        Name: { type: String },
        Bio: { type: String }
    },
    Actors: [{ type: String }],
    ImagePath: { type: String },
    Featured: { type: Boolean }
});

// User Schema
const userSchema = new mongoose.Schema({
    Username: { type: String, required: true },
    Password: { type: String, required: true },
    Email: { type: String, required: true },
    FirstName: { type: String }, // Add FirstName
    LastName: { type: String },  // Add LastName
    Birthday: { type: Date },
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});
// Hash Password (Static Method)
userSchema.statics.hashPassword = function (password) {
    return bcrypt.hashSync(password, 10);
};

// Validate Password (Instance Method)
userSchema.methods.validatePassword = function (password) {
    return bcrypt.compareSync(password, this.Password);
};

// Define Models
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

// Export Models
module.exports = { Movie, User };

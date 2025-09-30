# Movie API

A RESTful API for a movie database application built with Node.js, Express, and MongoDB. This API allows users to register, authenticate, and manage their favorite movies collection.

## Features

- **User Management**: Registration, authentication, and profile updates
- **Movie Database**: Browse movies with detailed information including genres and directors
- **Favorites System**: Add and remove movies from personal favorites list
- **JWT Authentication**: Secure API endpoints with JSON Web Tokens
- **Data Validation**: Input validation using express-validator
- **CORS Support**: Cross-origin resource sharing for frontend applications

## Technologies Used

- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT strategy
- **Password Security**: bcrypt for password hashing
- **Validation**: express-validator for input validation
- **Development Tools**: nodemon, ESLint

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- MongoDB (local installation or MongoDB Atlas account)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/grumongi/movie_api.git
   cd movie_api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory and add:
   ```
   CONNECTION_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Start the application**
   
   For development (with auto-restart):
   ```bash
   npm run dev
   ```
   
   For production:
   ```bash
   npm start
   ```

The API will be available at `http://localhost:8080`

## API Documentation

### Authentication

#### User Registration
```http
POST /users
Content-Type: application/json

{
  "Username": "johndoe",
  "Password": "securepassword",
  "Email": "john@example.com",
  "FirstName": "John",
  "LastName": "Doe",
  "Birthday": "1990-01-15"
}
```

#### User Login
```http
POST /login
Content-Type: application/json

{
  "Username": "johndoe",
  "Password": "securepassword"
}
```

### User Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/users` | Get all users | None |
| GET | `/users/:Username` | Get user by username | JWT Required |
| PUT | `/users/:Username` | Update user profile | JWT Required |
| DELETE | `/users/:Username` | Delete user account | JWT Required |
| POST | `/users/:Username/movies/:MovieID` | Add movie to favorites | JWT Required |
| DELETE | `/users/:Username/movies/:MovieID` | Remove movie from favorites | JWT Required |

### Movie Endpoints

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| GET | `/movies` | Get all movies | JWT Required |
| GET | `/movies/:Title` | Get movie by title | JWT Required |
| GET | `/movies/genre/:GenreName` | Get movies by genre | JWT Required |
| GET | `/movies/directors/:DirectorName` | Get movies by director | JWT Required |

### Data Models

#### User Model
```javascript
{
  Username: String (required, min 5 chars, alphanumeric),
  Password: String (required, hashed),
  Email: String (required, valid email),
  FirstName: String,
  LastName: String,
  Birthday: Date,
  FavoriteMovies: [ObjectId] (references Movie)
}
```

#### Movie Model
```javascript
{
  Title: String (required),
  Description: String (required),
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
}
```

## CORS Configuration

The API is configured to accept requests from the following origins:
- `http://localhost:1234` (Parcel development server)
- `http://localhost:4200` (Angular development server)
- `https://my-amazing-flix-2025.netlify.app` (Production frontend)
- `http://testsite.com` (Test environment)

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all user inputs
- **CORS Protection**: Configured to allow only specific origins

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `422` - Unprocessable Entity (validation errors)
- `500` - Internal Server Error

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented yet)

### Code Style

This project uses ESLint for code linting. Run the linter with:
```bash
npx eslint .
```

## Deployment

The API can be deployed to various platforms:

### Heroku
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git or GitHub integration

### Other Platforms
- Render
- Railway
- DigitalOcean App Platform
- AWS Elastic Beanstalk

Make sure to set the `CONNECTION_URI` environment variable to your MongoDB connection string.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please open an issue in the GitHub repository.
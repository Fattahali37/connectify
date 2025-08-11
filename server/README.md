# Connectify Server

Backend server for the Connectify social media application with authentication and user management.

## Features

- **User Authentication**: Signup, login, logout with JWT tokens
- **User Management**: Profile updates, search, follow/unfollow system
- **Security**: Password hashing, JWT validation, input validation
- **Database**: MongoDB with Mongoose ODM
- **API**: RESTful API with proper error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- MongoDB Compass (for database management)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/connectify
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

3. Start MongoDB service:

```bash
# On Ubuntu/Debian
sudo systemctl start mongod

# On macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod
```

4. Run the server:

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### POST /api/auth/signup

Register a new user

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /api/auth/login

Login user

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### GET /api/auth/me

Get current user profile (requires authentication)

#### POST /api/auth/refresh

Refresh JWT token (requires authentication)

#### POST /api/auth/logout

Logout user (requires authentication)

### Users

#### GET /api/users/profile/:username

Get user profile by username

#### PUT /api/users/profile

Update user profile (requires authentication)

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "bio": "Software developer"
}
```

#### GET /api/users/search?q=john&page=1&limit=10

Search users by username, first name, or last name

#### POST /api/users/follow/:userId

Follow a user (requires authentication)

#### DELETE /api/users/follow/:userId

Unfollow a user (requires authentication)

#### GET /api/users/followers

Get current user's followers (requires authentication)

#### GET /api/users/following

Get users that current user is following (requires authentication)

## Database Schema

### User Model

- `username`: Unique username (3-20 characters)
- `email`: Unique email address
- `password`: Hashed password (min 6 characters)
- `firstName`: First name (max 30 characters)
- `lastName`: Last name (max 30 characters)
- `profilePicture`: URL to profile picture
- `bio`: User bio (max 500 characters)
- `followers`: Array of user IDs following this user
- `following`: Array of user IDs this user is following
- `isVerified`: Account verification status
- `isActive`: Account active status
- `timestamps`: Created and updated timestamps

## Security Features

- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication
- Input validation with express-validator
- CORS enabled
- Environment variable configuration
- Error handling with sanitized error messages

## Development

The server uses nodemon for development, which automatically restarts when files change.

```bash
npm run dev
```

## Production

For production deployment:

1. Set `NODE_ENV=production`
2. Use a strong, unique `JWT_SECRET`
3. Configure MongoDB Atlas or production MongoDB instance
4. Set up proper CORS origins
5. Use HTTPS
6. Implement rate limiting
7. Add logging and monitoring

## Testing

Test the API endpoints using tools like:

- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

## Health Check

Check if the server is running:

```bash
curl http://localhost:5000/api/health
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

## Contributing

1. Follow the existing code style
2. Add proper error handling
3. Include input validation
4. Test your changes
5. Update documentation if needed

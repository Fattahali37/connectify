# Connectify - Social Media Application

A modern social media application built with React (JavaScript) frontend and Node.js backend with MongoDB database.

## Features

### Frontend (React + JavaScript)

- **Modern UI**: Built with React 18 and Tailwind CSS
- **Responsive Design**: Mobile-first approach with beautiful dark theme
- **Authentication**: Login and signup with JWT tokens
- **User Management**: Profile editing, search, follow/unfollow system
- **Social Features**: Posts, likes, comments, messaging
- **Real-time Updates**: Live notifications and chat functionality

### Backend (Node.js + Express)

- **RESTful API**: Clean and well-structured endpoints
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Input validation with express-validator
- **Security**: CORS enabled, environment variables, error handling
- **User Management**: Complete user CRUD operations

## Tech Stack

### Frontend

- **React 18** - UI library
- **JavaScript** - Programming language
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Vite** - Build tool and dev server

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object Data Modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn package manager

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd connectify
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/connectify
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Frontend Setup

```bash
# From the root directory
npm install
```

### 4. Start MongoDB

```bash
# On Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod

# On macOS with Homebrew
brew services start mongodb-community

# Or start manually
mongod
```

### 5. Run the Application

#### Start Backend Server

```bash
cd server
npm run dev
```

The backend will run on http://localhost:5000

#### Start Frontend Development Server

```bash
# From the root directory
npm run dev
```

The frontend will run on http://localhost:5173

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Users

- `GET /api/users/profile/:username` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users
- `POST /api/users/follow/:userId` - Follow user
- `DELETE /api/users/follow/:userId` - Unfollow user
- `GET /api/users/followers` - Get user followers
- `GET /api/users/following` - Get user following

## Project Structure

```
connectify/
├── src/                    # Frontend source code
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── server/                 # Backend source code
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── server.js      # Main server file
│   ├── package.json
│   └── .env
├── package.json            # Frontend dependencies
├── vite.config.js         # Vite configuration
└── tailwind.config.js     # Tailwind CSS configuration
```

## Usage

### 1. Create an Account

- Navigate to `/signup`
- Fill in your details (username, email, password, first name, last name)
- Click "Create Account"

### 2. Login

- Navigate to `/login`
- Enter your email and password
- Click "Sign in"

### 3. Explore Features

- **Home**: View posts from users you follow
- **Search**: Find and connect with other users
- **Profile**: Edit your profile information
- **Chat**: Send messages to other users
- **Create Post**: Share your thoughts and images

## Development

### Frontend Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development

```bash
cd server
npm run dev          # Start with nodemon (auto-restart)
npm start            # Start production server
```

### Database Management

- Use MongoDB Compass for visual database management
- Connect to `mongodb://localhost:27017/connectify`
- Collections: `users`, `posts`, `messages`

## Environment Variables

### Backend (.env)

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRE`: JWT token expiration time
- `NODE_ENV`: Environment (development/production)

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation with express-validator
- **CORS Protection**: Configurable cross-origin resource sharing
- **Environment Variables**: Secure configuration management
- **Error Handling**: Sanitized error messages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

### API Testing

Use tools like Postman, Insomnia, or curl to test the API endpoints:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

## Deployment

### Frontend

```bash
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend

```bash
cd server
npm start
# Use PM2 or similar process manager for production
```

### Database

- Use MongoDB Atlas for cloud hosting
- Update MONGODB_URI in production environment
- Set NODE_ENV=production

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**

   - Ensure MongoDB service is running
   - Check connection string in .env file
   - Verify MongoDB is accessible on port 27017

2. **Port Already in Use**

   - Change PORT in .env file
   - Kill processes using the port: `lsof -ti:5000 | xargs kill`

3. **JWT Token Issues**

   - Check JWT_SECRET in .env file
   - Ensure token is being sent in Authorization header
   - Verify token expiration

4. **CORS Issues**
   - Check CORS configuration in server.js
   - Ensure frontend URL is allowed

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS approach
- MongoDB team for the database
- Express.js community for the web framework

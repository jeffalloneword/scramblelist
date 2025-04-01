# Scramblelist Application Architecture

This document provides a detailed overview of the architecture, technology stack, and components used in the Scramblelist gift exchange organizer application.

## System Overview

Scramblelist is a web-based application designed to help users organize gift exchanges. It allows users to:
- Add participants to a gift exchange
- Generate random gift assignments
- Save and view past exchanges
- Access past assignments
- Manage participants across exchanges

The application follows a client-server architecture with a browser-based frontend and a Node.js-powered backend, using PostgreSQL for data persistence. The entire system is secured with password-based authentication.

## Technology Stack

### Frontend

- **HTML5**: Provides structure for the user interface
- **CSS3**: Handles styling and responsive design
- **JavaScript (ES6+)**: Implements client-side functionality and interactions
- **Fetch API**: Manages AJAX requests to the backend
- **DOM Manipulation**: Updates the UI dynamically based on user interactions and server responses
- **CSS Animations**: Powers the animated loading screen with the black cat silhouette

### Backend

- **Node.js**: JavaScript runtime environment for the server
- **Express**: Web framework for handling HTTP requests and serving content
- **Cookie-Parser**: Middleware for parsing cookies for authentication
- **Crypto**: Node.js module for password hashing
- **Path**: Node.js module for file path operations

### Database

- **PostgreSQL**: Relational database for persistent data storage
- **node-postgres (pg)**: PostgreSQL client for Node.js
- **In-memory Fallback**: JavaScript objects that simulate a database when PostgreSQL is unavailable

### Authentication

- **Cookie-based Authentication**: HTTP-only cookies to maintain user sessions
- **Password Protection**: Simple password verification with hashing

### Deployment

- **Bash Script**: `clone_and_run.sh` for easy deployment
- **Environment Variables**: For database connection configuration
- **Port Configuration**: Static port assignment (5000)

## System Components

### 1. Authentication System

- **Login Page**: Simple form for password entry
- **Auth Middleware**: Checks cookie-based authentication
- **Protected Routes**: Restricts access to authenticated users only

### 2. Participant Management

- **Add Participant Form**: Interface for adding new participants
- **Participant List**: Displays current participants
- **API Endpoints**: 
  - `/api/participants` (GET): Retrieves all participants
  - `/api/participants` (POST): Adds a new participant

### 3. Exchange Generation

- **Exchange Creation Form**: Collects exchange title and description
- **Assignment Algorithm**: Randomizes gift assignments ensuring no one gets themselves
- **Animation System**: Shows cat animation during processing
- **API Endpoint**: `/api/exchanges` (POST): Creates a new exchange with participants and assignments

### 4. Exchange History

- **Past Exchanges List**: Shows all previously created exchanges
- **Exchange Details**: Displays assignments and participants for a selected exchange
- **API Endpoints**:
  - `/api/exchanges` (GET): Retrieves all exchanges
  - `/api/exchanges/:id` (GET): Gets details for a specific exchange

### 5. Database Schema

The application uses four main database tables:

1. **participants**:
   - `id`: Unique identifier (Primary Key)
   - `name`: Participant name
   - `email`: Optional email address
   - `created_at`: Timestamp of creation

2. **exchanges**:
   - `id`: Unique identifier (Primary Key)
   - `title`: Exchange title
   - `description`: Optional exchange description
   - `created_at`: Timestamp of creation

3. **exchange_participants**:
   - `id`: Unique identifier (Primary Key)
   - `exchange_id`: Foreign key to exchanges
   - `participant_id`: Foreign key to participants
   - `created_at`: Timestamp of creation

4. **assignments**:
   - `id`: Unique identifier (Primary Key)
   - `exchange_id`: Foreign key to exchanges
   - `giver_id`: Foreign key to participants (gift giver)
   - `receiver_id`: Foreign key to participants (gift receiver)
   - `created_at`: Timestamp of creation

## Data Flow

1. **User Authentication**:
   - User enters password
   - Server verifies password
   - Server sets authenticated cookie
   - User is redirected to main application

2. **Adding Participants**:
   - User enters participant name
   - Client sends POST request to server
   - Server adds participant to database
   - Client refreshes participant list

3. **Creating Exchange**:
   - User enters exchange title and description
   - User clicks "Generate Assignments"
   - Loading animation displays
   - Client generates random assignments
   - Client sends POST request with assignments to server
   - Server saves exchange, participants, and assignments
   - Client displays results

4. **Viewing Past Exchanges**:
   - Client loads past exchanges from server
   - User clicks on exchange
   - Client retrieves exchange details from server
   - Client displays exchange details and participants

## Security Considerations

1. **Authentication**: Simple password-based protection
2. **Cookies**: HTTP-only cookies to prevent client-side JavaScript from accessing
3. **Data Validation**: Server-side validation of inputs
4. **Error Handling**: Sanitized error messages to prevent information disclosure

## Deployment Configuration

The application can be deployed in two modes:

1. **With Database**:
   - Requires PostgreSQL
   - Uses either DATABASE_URL or individual PostgreSQL environment variables
   - Full functionality with persistent storage

2. **Without Database**:
   - Falls back to in-memory data structures
   - Limited persistence (data is lost on server restart)
   - Suitable for demonstration purposes only

## Frontend Design

### User Interface Components

- **Login Screen**: Simple form with password field
- **Participant Management**: Form and list for adding/viewing participants
- **Exchange Creation**: Form for creating new exchanges
- **Results Display**: Shows gift assignments
- **Exchange History**: Lists past exchanges with details

### Responsive Design

- Mobile-friendly layout using:
  - Flexible grid system
  - Relative units (rem, %, etc.)
  - Media queries for different screen sizes
  - Touch-friendly buttons and controls

### Visual Elements

- **Loading Animation**: Black cat silhouette chasing a ball
- **Color Scheme**: Clean, minimalist design with accent colors
- **Typography**: Sans-serif fonts for readability
- **Card-based Layout**: Content organized in card containers

## Conclusion

The Scramblelist application combines modern web technologies to create a responsive, secure, and user-friendly gift exchange organization tool. Its modular architecture allows for easy maintenance and future expansion, while the fallback database functionality ensures it can be deployed in various environments with minimal configuration.
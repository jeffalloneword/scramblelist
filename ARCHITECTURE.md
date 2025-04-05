# Scramblelist Technical Architecture

## Overview

Scramblelist is a web application that functions as a gift exchange organizer. It uses a simple architecture with a Node.js/Express backend serving static files, and a JavaScript frontend that relies on the browser's localStorage API for data persistence.

## Components

### Backend (Server)
- **Node.js with Express**: Serves the static files and handles basic routing
- **app.js**: The main server file that sets up Express and routes
- **deploy.js**: A utility script for creating deployable packages

### Frontend (Browser)
- **HTML/CSS/JavaScript**: Standard web technologies for UI and logic
- **localStorage API**: Used for client-side data persistence
- **No frameworks**: Vanilla JavaScript for simplicity and lightweight operation

## Data Structure

### localStorage Keys
- `scramblelist_participants`: Array of participant objects
- `scramblelist_exchanges`: Array of exchange objects with assignments

### Object Models

#### Participant Object
```javascript
{
  id: Number,        // Unique identifier
  name: String,      // Participant's name
  email: String,     // Email (unused in current version)
  created_at: String // ISO date string
}
```

#### Exchange Object
```javascript
{
  id: Number,           // Unique identifier
  title: String,        // Exchange title
  description: String,  // Optional description
  created_at: String,   // ISO date string
  participants: Array,  // Array of participant objects
  assignments: Array    // Array of assignment objects
}
```

#### Assignment Object
```javascript
{
  giver: Participant,   // The person giving a gift
  receiver: Participant // The person receiving a gift
}
```

## Key Files

### Server Files
- **app.js**: Express server setup and routes
- **deploy.js**: Deployment utility script
- **clone_and_run.sh**: Deployment runner script

### Frontend Files
- **public/index.html**: Main application page
- **public/results.html**: Assignment results display page
- **public/styles.css**: Shared styles for both pages
- **public/scripts.js**: Main application logic
- **public/results.js**: Results page logic

## Core Functionality

### 1. Participant Management
- Add participants
- Remove individual participants
- Clear all participants

### 2. Exchange Generation
- Create a new exchange with title and description
- Generate random assignments using a shuffle algorithm
- Ensure no participant is assigned to themselves

### 3. Results Display
- Show assignment results on a separate page
- Make results sharable via URL with exchange ID parameter

## Flow Diagram

```
User Interaction         Browser Storage          Display
┌───────────────┐       ┌──────────────┐        ┌────────────┐
│ Add           │       │              │        │            │
│ Participant   ├──────►│ localStorage ├───────►│ Update UI  │
└───────────────┘       │              │        └────────────┘
                        └──────────────┘
┌───────────────┐       ┌──────────────┐        ┌────────────┐
│ Generate      │       │              │        │            │
│ Assignments   ├──────►│ localStorage ├───────►│ Results    │
└───────────────┘       │              │        │ Page       │
                        └──────────────┘        └────────────┘
```

## Design Decisions

1. **localStorage instead of Database**
   - Simplifies deployment and usage
   - Eliminates server-side persistence requirements
   - Allows the app to function without internet once loaded

2. **Separate Results Page**
   - Provides a clean, focused view of assignments
   - Makes sharing results easier
   - Improves user experience

3. **No Authentication**
   - Simplifies user experience
   - Appropriate for the local storage model
   - Exchanges can be "secured" by not sharing the URL

4. **Cat Animation**
   - Provides visual engagement during assignment generation
   - Creates a playful, memorable user experience

## Deployment Strategy

The application is designed for easy deployment:

1. The **deploy.js** script creates a ready-to-deploy package
2. Standard static file hosting is sufficient
3. No database setup required
4. Minimal server requirements (just Node.js and Express)

## Future Extension Possibilities

1. **Export/Import Functionality**
   - Allow users to export/import their data as JSON files

2. **Theme Options**
   - Add light/dark mode and seasonal themes

3. **Participant Exclusions**
   - Allow setting rules for who cannot be assigned to whom

4. **Multiple Lists**
   - Enable saving multiple participant lists for different contexts

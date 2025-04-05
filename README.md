# Scramblelist - Gift Exchange Organizer

A lightweight web application for organizing gift exchanges with localStorage for client-side persistence.

## Features

- Add participants to create gift exchange lists
- Remove individual participants with dedicated remove buttons
- Generate random gift exchange assignments ensuring no one gets assigned to themselves
- Animated loading screen with detailed black cat silhouette chasing a ball (10 seconds)
- Store participant information and assignments in browser localStorage
- Mobile-friendly responsive design
- Clean, dedicated results page for viewing assignments
- Start with an empty participant list by default

## Technical Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express (serving static files only)
- **Storage**: Browser localStorage (no database required)
- **Animation**: CSS animations for loading spinner

## Running the Application

To run the application, simply execute the included shell script:

```bash
./start.sh
```

Or run directly with Node.js:

```bash
node app.js
```

This will:
1. Start the Express server
2. Serve the static files
3. Make the application available on port 5000

You can then access the application in your browser at: http://localhost:5000

## Deployment

The application is designed for easy deployment with minimal requirements:

### Simple Deployment Steps

1. Ensure Node.js is installed (v14 or later recommended)
2. Run `node deploy.js` to create a deployment package
3. Copy the contents of the `/deploy` directory to your server
4. Start the application with: `node app.js` or `./start.sh`
5. The application will run on port 5000 by default (customizable via PORT environment variable)

### Deploying on Replit

1. Fork or clone this repository to your Replit account
2. Make sure the NodeJS environment is selected
3. Click the "Run" button in the Replit interface, or use the workflow
4. Your app will be available at your Replit subdomain

### Using the Deployment Script

The included `deploy.js` script helps create a clean deployment package:

```bash
node deploy.js
```

This will:
1. Create a `/deploy` directory with all necessary files
2. Copy the application files with a clean directory structure
3. Generate an appropriate README.md for the deployed version
4. Create a start.sh script for easy startup

## Data Storage

The application uses browser localStorage to store:

- **Participants**: Name and ID for each person in the exchange
- **Exchanges**: Title, description, participants, and assignments for each exchange

No data is sent to a server, and all information remains in the user's browser.

## Project Documentation

- **USAGE_GUIDE.md**: Detailed guide for end-users
- **ARCHITECTURE.md**: Technical overview of the application architecture

## License

MIT

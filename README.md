# Scramblelist - Gift Exchange Organizer

A web application for organizing gift exchanges with database integration for persistent storage.

## Features

- Add participants with optional email addresses
- Generate random gift exchange assignments ensuring no one gets assigned to themselves
- Store participant information in a PostgreSQL database
- Mobile-friendly responsive design

## Technical Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL

## Running the Application

To run the application, simply execute the included shell script:

```bash
bash clone_and_run.sh
```

This will:
1. Check for required dependencies
2. Check database connection status
3. Start the server on port 5000

You can then access the application in your browser at: http://0.0.0.0:5000

## Database Setup

The application uses a PostgreSQL database to store participant information. The database schema includes the following tables:

- `participants`: Stores information about exchange participants
- `exchanges`: Tracks gift exchange events
- `assignments`: Records gift exchange assignments

## API Endpoints

The application provides the following API endpoints:

- `GET /api/health`: Check server and database health
- `GET /api/setup`: Set up the database tables
- `GET /api/participants`: Get all participants
- `POST /api/participants`: Add a new participant

## License

MIT
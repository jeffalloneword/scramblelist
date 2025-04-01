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

## Deployment

### Database Configuration

The application requires PostgreSQL database access. Ensure one of the following is set up:

1. Set the `DATABASE_URL` environment variable with your PostgreSQL connection string:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   ```

2. OR set all of the following environment variables:
   - `PGHOST`: PostgreSQL server hostname
   - `PGUSER`: PostgreSQL username
   - `PGPASSWORD`: PostgreSQL password
   - `PGDATABASE`: PostgreSQL database name
   - `PGPORT`: PostgreSQL server port (usually 5432)

The application will automatically detect and use these variables to connect to your database.

### Deployment Steps

1. Ensure Node.js is installed (v14 or later recommended)
2. Set the database environment variables as described above
3. Start the application with: `node app.js`
4. The application will run on port 5000 by default

### Authentication

The application is protected with a password. The default password is:
```
two-pretzels!1
```

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
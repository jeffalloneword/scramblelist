# Scramblelist - Gift Exchange Organizer

A standalone web application for organizing gift exchanges with database integration for persistent storage.

## Features

- Add participants to create gift exchange lists
- Generate random gift exchange assignments ensuring no one gets assigned to themselves
- Animated loading screen with black cat silhouette chasing a ball
- Password protection for secure access
- Store participant information and assignments in a database
- Mobile-friendly responsive design
- Start with an empty participant list by default

## Technical Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL (optional - works in memory if no database is available)
- **Authentication**: Cookie-based with password protection

## Running the Application

To run the application, simply execute the included shell script:

```bash
bash clone_and_run.sh
```

This will:
1. Check for required dependencies (Node.js, npm)
2. Install any missing Node.js packages (express, pg, cookie-parser)
3. Set up database connection if environment variables are available
4. Start the server on port 5000

You can then access the application in your browser at: http://0.0.0.0:5000

### Default Login

The application is protected with a password:
```
two-pretzels!1
```

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

### Standard Deployment Steps

1. Ensure Node.js is installed (v14 or later recommended)
2. Set the database environment variables as described above
3. Start the application with: `node app.js` or `./start.sh`
4. The application will run on port 5000 by default

### Deploying on Replit

1. Fork or clone this repository to your Replit account
2. Make sure the NodeJS environment is selected
3. Set up the database:
   - In Replit, go to "Secrets" in the Tools panel
   - Add your database credentials as secrets (DATABASE_URL or individual PostgreSQL variables)
4. Deploy using one of these methods:
   - Click the "Deploy" button in the Replit interface
   - Or run `node app.js` directly in the Shell
5. Your app will be available at your Replit subdomain

Note: The application includes fallback in-memory storage if no database is configured, so you can test it without setting up a database, but data won't persist between restarts.

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
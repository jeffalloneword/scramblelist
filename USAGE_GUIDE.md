# Scramblelist Usage Guide

This guide provides step-by-step instructions on how to use the Scramblelist gift exchange organizer application.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Logging In](#logging-in)
3. [Adding Participants](#adding-participants)
4. [Creating a Gift Exchange](#creating-a-gift-exchange)
5. [Viewing Exchange Results](#viewing-exchange-results)
6. [Managing Past Exchanges](#managing-past-exchanges)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Access to the Scramblelist application URL

### Accessing the Application

1. Open your web browser
2. Navigate to the application URL (usually http://localhost:5000 in local installations)
3. You will be presented with a login screen

## Logging In

1. On the login screen, enter the password
   - Default password: `two-pretzels!1`
2. Click "Login" or press Enter
3. If the password is correct, you will be redirected to the main application
4. If incorrect, an error message will appear and you can try again

## Adding Participants

1. In the "Participants" section, locate the "Add Participant" form
2. Enter the participant's name in the "Name" field
3. Click the "Add Participant" button
4. The participant will appear in the "Current Participants" list below
5. Repeat this process for each participant you want to add

**Notes:**
- You need at least 2 participants to create a gift exchange
- Each participant must have a unique name
- The participant list starts empty by default

### Managing the Participant List

- To clear all participants, click the "Clear All" button
- When viewing participants from a past exchange, you can click "Load All Participants" to load the complete list

## Creating a Gift Exchange

1. After adding participants, navigate to the "Gift Exchange" section
2. Enter a title for your exchange (e.g., "Holiday Gift Exchange 2025") in the "Exchange Title" field
3. Optionally, add a description in the "Description" field (e.g., "Annual holiday gift exchange. $25 limit.")
4. Click the "Generate Assignments" button
5. The system will display an animated loading screen with a black cat chasing a ball (10 seconds)
6. Wait for the animation to complete and the assignments to be generated

## Viewing Exchange Results

1. After generating assignments, the "Assignment Results" section will appear
2. This section displays who each person should give a gift to
3. Each line shows a gift giver and their assigned recipient
4. These assignments ensure that no one is assigned to give a gift to themselves
5. The results are automatically saved to the database

## Managing Past Exchanges

1. The "Past Gift Exchanges" section at the bottom of the page shows all previously created exchanges
2. Click on an exchange to view its details
3. The exchange details include:
   - Exchange title
   - Date created
   - Description (if provided)
   - Number of participants
   - List of assignments

### Loading Participants from Past Exchanges

1. Click on a past exchange to select it
2. The participants from that exchange will load into the "Current Participants" list
3. A notice will appear indicating you are viewing participants from a selected exchange
4. You can click "Load All Participants" to load the complete list of all participants
5. Click "Clear All" to start with an empty list again

## Troubleshooting

### Login Issues

- Ensure you are using the correct password
- Check for caps lock or typing errors
- Clear browser cookies and try again

### Database Connection Issues

- If you see database errors, ensure the PostgreSQL database is properly configured
- Check the database environment variables (DATABASE_URL or individual PostgreSQL variables)
- The application will still work with limited functionality using in-memory storage if no database is available

### Participant Management

- If you cannot add participants, ensure the name field is not empty
- If participants are not appearing in the list, refresh the page
- If you see unexpected behavior with the participant list, try clearing all participants and adding them again

### Exchange Generation

- If you receive an error when generating exchanges, ensure you have at least 2 participants
- If the loading animation continues indefinitely, refresh the page and try again
- If assignments are not being saved, check the database connection

## Additional Information

### Data Storage

- All participants and exchanges are stored in a PostgreSQL database
- If no database is available, data is stored in memory temporarily
- Data stored in memory will be lost when the server restarts

### Security

- The application is protected with a password
- Your session is maintained through cookies
- The session expires after 24 hours of inactivity

### Browser Compatibility

- The application works best with modern browsers
- If you encounter styling issues, try updating your browser
- Mobile devices are supported through responsive design
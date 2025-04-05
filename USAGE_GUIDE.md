# Scramblelist Usage Guide

## Introduction

Scramblelist is a simple and intuitive gift exchange organizer that allows you to create random gift assignments for holiday exchanges, office parties, or any other gift-giving event. This application runs entirely in your browser and uses localStorage to save your data locally, meaning there's no need for user accounts or a database.

## Key Features

- Add multiple participants to your gift exchange
- Remove individual participants as needed
- Create named exchanges with optional descriptions
- Generate random assignments where no one gets their own name
- View assignments on a dedicated clean results page
- Animated black cat loading screen during assignment generation
- Persistent storage using your browser's localStorage

## Getting Started

1. Open the application in your web browser
2. Add participants using the "Add Participant" form
3. Give your exchange a title and optional description
4. Click "Generate Assignments" to create the exchange

## Adding Participants

1. Enter a participant's name in the "Name" field
2. Click "Add Participant" 
3. The participant will appear in the "Current Participants" list
4. Add as many participants as needed (minimum of 2 required)

## Managing Participants

- **Remove Individual Participant:** Click the "✕" button next to a participant's name
- **Clear All Participants:** Click the "Clear All" button at the top of the participants list

## Creating an Exchange

1. Enter an exchange title (required)
2. Add an optional description for additional details
3. Make sure you have at least 2 participants added
4. Click "Generate Assignments"
5. Wait for the animated black cat to finish chasing the ball (10 seconds)
6. You'll be redirected to the results page showing assignments

## Viewing Results

The results page displays:
- Exchange title
- Exchange description
- Date and time created
- Complete list of assignments (who gives to whom)
- "Back to Home" button to return to the main page

## Technical Information

- This application uses browser localStorage to store data
- No data is sent to a server or stored in a database
- All data is stored locally in your browser
- Clearing your browser cache or using private browsing will remove saved data

## Deployment

The application can be easily deployed and shared:
1. Use the built-in deploy.js script to create a deployable package
2. Copy the files to any web server or hosting service
3. No database setup required

## Troubleshooting

- **Assignments Not Showing:** Ensure you have at least 2 participants
- **Data Not Persisting:** Check that localStorage is enabled in your browser
- **Loading Screen Stuck:** Refresh the page and try again

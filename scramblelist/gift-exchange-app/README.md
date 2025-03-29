# Gift Exchange App

## Overview
The Gift Exchange App is a mobile-optimized web application that allows users to create a gift exchange list. Users can add participants, and the app will randomly assign gift recipients, ensuring that no one is assigned to themselves.

## Features
- Add names of gift exchange participants.
- Randomly select recipients for each participant.
- Mobile-optimized design for easy use on smartphones and tablets.

## Project Structure
```
gift-exchange-app
├── public
│   ├── index.html        # Main HTML document
│   └── styles.css       # Styles for the web app
├── src
│   ├── app.js           # Entry point of the application
│   ├── components
│   │   ├── AddParticipants.js  # Component for adding participants
│   │   ├── GenerateList.js      # Component for generating the gift list
│   │   └── ParticipantList.js    # Component for displaying participants
│   └── utils
│       └── randomize.js        # Utility for randomizing recipient assignments
├── package.json       # Configuration file for npm
└── README.md          # Documentation for the project
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/gift-exchange-app.git
   ```
2. Navigate to the project directory:
   ```
   cd gift-exchange-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the development server:
   ```
   npm start
   ```
2. Open your browser and go to `http://localhost:3000` to view the app.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you would like to add.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
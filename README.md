# Print Tracking Software

## Overview
The Print Tracking Software is a real-time print management system built with **React** and **Node.js**, utilizing **WebSockets** to enable multi-user connectivity. It allows users to track individual lines across **14 machines**, divided into **Large** and **Cells** (sticker sizes), and categorize them as **Reorder**, **Priority**, or **Backstock**. Additionally, users can input messages under each machine that are visible to all connected users.

## Features
- **Real-Time Updates**: Uses WebSockets to synchronize data across all users instantly.
- **Machine Tracking**: Displays 14 machines divided into Large and Cells categories.
- **Line Status**: Assigns individual lines to Reorder, Priority, or Backstock.
- **Shared Messaging**: Allows users to add messages under each machine that all users can see.
- **Multi-User Support**: Enables multiple users to view and update data concurrently.

## Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **WebSockets**: Socket.io for real-time communication

## Installation
### Prerequisites
Ensure you have **Node.js** and **npm** installed on your machine.

### Backend Setup
1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the React app:
   ```sh
   npm start
   ```

## Usage
1. Open the frontend in a web browser (usually at `http://localhost:3000`).
2. View all 14 machines with their lines and statuses.
3. Modify line statuses (Reorder, Priority, Backstock) as needed.
4. Add messages under machines; updates will sync in real time.
5. All changes are visible to connected users instantly.

## Future Improvements
- User authentication and roles.
- History tracking for status changes.
- Integration with a database for persistent storage.

## License
This project is licensed under the MIT License.

## Contributors
- **Elijah Camacho** *(Developer)*
- Additional contributors if applicable.

---
For any issues or feature requests, please open a GitHub issue or contact the development team.

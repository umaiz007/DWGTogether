# DWG Together

A real-time collaborative DWG review application that enables multiple users to view, annotate, and collaborate on DWG files using Autodesk Platform Services (APS).

## Features

- View DWG files from Autodesk Docs
- Real-time collaboration and annotations
- Multi-user presence and cursor tracking
- Markup tools for design review
- Cloud-based workflow integration

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Autodesk Developer Account with APS credentials
- Access to Autodesk Docs with DWG files

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   APS_CLIENT_ID=your_client_id_here
   APS_CLIENT_SECRET=your_client_secret_here
   APS_CALLBACK_URL=http://localhost:3000/auth/callback
   PORT=5000
   NODE_ENV=development
   SESSION_SECRET=your_session_secret_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
dwg-together/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # React components
│       ├── services/       # API services
│       └── utils/          # Utility functions
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
├── .env                   # Environment variables
└── package.json           # Project dependencies
```

## Development Phases

1. Phase 1: DWG Viewer Integration
   - APS OAuth authentication
   - File browsing in Autodesk Docs
   - DWG viewing with APS Viewer

2. Phase 2: Markup Tools
   - Drawing tools implementation
   - Annotation system
   - Local storage of markups

3. Phase 3: Real-time Collaboration
   - WebSocket integration
   - Multi-user sync
   - Presence tracking

4. Phase 4: Enhanced Features
   - Comments and chat
   - User focus tracking
   - Session management

5. Phase 5: Export & Save
   - Session saving
   - Export functionality
   - Version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. # DWGTogether

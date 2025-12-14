# Inventory Manager

This repository contains the source code for the Inventory Manager application, featuring a Node.js/Express backend and a React/Vite frontend.

## Project Structure

- **Backend:** Node.js + Express (located in the root directory)
- **Frontend:** React + Vite (located in the `frontend` directory)

## Prerequisites

- **Node.js**: Version 22.12.0 or higher
- **MongoDB**: You need a running MongoDB instance (local or Atlas)

## Setup & Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cfanbinv
```

### 2. Install Dependencies

You need to install dependencies for both the backend (root) and the frontend.

**Backend:**
```bash
pnpm install
```

**Frontend:**
```bash
cd frontend
pnpm install
cd ..
```

### 3. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
PORT=3000
NODE_ENV=development
```
*Note: Replace `your_mongodb_connection_string` with your actual MongoDB URI.*

## Running the Application

### Backend Development Server
To start the backend server with hot-reloading (using nodemon):

```bash
pnpm run dev
```
The backend API will be running at `http://localhost:3000`.

### Frontend Development Server
To start the React frontend:

```bash
cd frontend
pnpm run dev
```
The frontend will run at `http://localhost:5173`.

## Building for Production

To build the entire application (installs dependencies and builds frontend):

```bash
pnpm run build
```

The frontend build output will be located in `frontend/dist`.

## Deployment

The project is configured for deployment on Vercel. Expects the following output directory:
- Frontend: `frontend/dist`
- Backend: Root directory (server.js)

```bash
pnpm run start
```
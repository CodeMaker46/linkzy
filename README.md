# linkzy

## Development Setup

### Client (React)

1. Open a terminal and navigate to the `client` directory:
   ```sh
   cd client
   ```
2. Install dependencies (if not already):
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
   The client will run on [http://localhost:5173](http://localhost:5173) by default.

### Server (Express)

1. Open a separate terminal and navigate to the `server` directory:
   ```sh
   cd server
   ```
2. Install dependencies (if not already):
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
   The server will run on [http://localhost:5000](http://localhost:5000) by default.

---

- The client and server run independently in development.
- Update API URLs in the client to point to the Express server (e.g., `http://localhost:5000`).
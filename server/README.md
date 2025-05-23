# Server Project

This is the server component of the webhook incoming project.

## Scripts

- `start`: Runs the server using nodemon for development (`nodemon src/index.ts`)
- `build`: Compiles TypeScript files (`tsc`)
- `serve`: Runs the compiled JavaScript code (`node dist/index.js`)

## Dependencies

- `cors`: Middleware for enabling Cross-Origin Resource Sharing
- `dotenv`: Loads environment variables from a `.env` file
- `express`: Fast, unopinionated, minimalist web framework
- `socket.io`: Real-time bidirectional event-based communication
- `ts-node`: TypeScript execution environment for Node.js
- `typescript`: JavaScript with syntax for types.
- `uuid`: For generating RFC-compliant UUIDs

## Development Dependencies

- `@types/*`: TypeScript type definitions
- `nodemon`: Utility that will restart the node application when it detects changes

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server in development mode:
   ```bash
   npm start
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Serve the compiled project:
   ```bash
   npm run serve
   ```

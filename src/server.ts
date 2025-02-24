// Import the 'express' module along with 'Request' and 'Response' types from express
import express, { Application, Request, Response } from 'express';

// Create an Express application
const app:Application = express();

// Specify the port number for the server
import {port, Database, environment} from './config'
import router from './api/routes';


Database.connection();

//Routes
app.use("/api/v1", router);

// Define a route for the root path ('/')
app.get('/', (req: Request, res: Response) => {
  // Send a response to the client
  res.send('Hello, TypeScript + Node.js + Express!');
});

// Start the server and listen on the specified port
app.listen(port, () => {
  // Log a message when the server is successfully running
  console.log(`Server is running on http://localhost:${port} on ${environment} server`);
});
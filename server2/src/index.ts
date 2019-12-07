import express from "express";
import * as routes from "./routes";
const app = express();
const port = 4000; // default port to listen

// Configure Express to parse incoming JSON data
app.use( express.json() );

// Configure routes
routes.register( app );

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );

// start the Express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );

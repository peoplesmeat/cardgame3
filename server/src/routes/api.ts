import * as express from "express";
// import pgPromise from "pg-promise";

export const register = ( app: express.Application ) => {

    app.get( `/api/guitars/all`, async ( req: any, res ) => {
        try {
            const k = Array(9).fill(null);
            k[0] = "X";
            k[1] = "X";
            k[2] = "X";
            return res.json( k );
        } catch ( err ) {
            // tslint:disable-next-line:no-console
            console.error(err);
            res.json( { error: err.message || err } );
        }
    } );

};

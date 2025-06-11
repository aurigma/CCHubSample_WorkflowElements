import { Request, Response, NextFunction, RequestHandler } from "express";
import winston from "winston";

// Returns a middleware for logging endpoint calls
export function logEndpoint(logger: winston.Logger, message?: string): RequestHandler {
    return (req, res, next) => {
        let msg = message || `Endpoint called: ${req.method} ${req.originalUrl} from ${req.ip}`;
        if (req.body && Object.keys(req.body).length > 0) {
            msg += ` with body: ${JSON.stringify(req.body)}`;
        }
        logger.info(msg);
        next();
    };
}
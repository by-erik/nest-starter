import { Logger } from "@nestjs/common";
import { randomBytes } from "crypto";
import { Request, Response } from "express";

export class RequestResponeLogger {

    constructor(private readonly logger: Logger) {
    }

    logRequest(request: Request): void {     
        const requestLine = this.getRequestLine(request);

        request.logging = { id: randomBytes(4).toString('hex') };

        let requestLog = `Req(${request.logging.id}): "${requestLine}"`;

        if (Object.keys(request.body).length) {
            requestLog = requestLog.concat("\n", JSON.stringify(request.body, null, 0));
        }

        this.logger.log(requestLog);
    }

    logResponse(request: Request, response: Response, body: unknown, status?: number): void {
        const id = request.logging?.id ? request.logging.id : '--------';
        const requestLine = this.getRequestLine(request);
        const statusCode = status ? status : response.statusCode;

        const bodyAsString = this.getBody(body);
        const contentLength = bodyAsString.length;

        let requestLog = `Res(${id}): "${requestLine}" ${statusCode} ${contentLength}`;

        if (bodyAsString.length > 0) {
            requestLog = requestLog.concat("\n", bodyAsString);
        }

        this.logger.log(requestLog); 
    }

    private getRequestLine(request: Request): string {
        const { method, url, httpVersion, protocol } = request;
        return `${method} ${url} ${protocol.toUpperCase()}/${httpVersion}`;
    }

    private getBody(body: unknown): string {
        if (body === null || body === undefined) {
            return '';
        }
        const type = typeof(body);
        switch(type) {
            case 'string':
                return (body as string);
            case 'number':
                return (body as number).toString();
            case 'boolean':
                return (body as boolean).toString();
            case 'object':
                return JSON.stringify(body, null, 0);
        }

    }

}
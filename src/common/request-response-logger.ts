import { Logger } from "@nestjs/common";
import { randomBytes } from "crypto";
import { Request, Response } from "express";

interface RequestData {
    param?: any,
    query?: any,
    body?: any
}

interface ResponseData {
    headers?: any;
    body?: any
}

export class RequestResponeLogger {

    constructor(private readonly logger: Logger) {
    }

    logRequest(request: Request): void {
        const id = randomBytes(4).toString('hex');
        const requestLine = this.getRequestLine(request);

        let requestLog = `Req(${id}): "${requestLine}"`;

        if (Object.keys(request.body).length) {
            requestLog = requestLog.concat("\n", JSON.stringify(request.body, null, 2));
        } else {}

        (request as any).id = id;

        this.logger.log(requestLog);
    }

    logResponse(request: Request, response: Response, body: any, status?: number): void {
        const id = request.hasOwnProperty('id') ? (request as any).id : '--------';
        const requestLine = this.getRequestLine(request);
        const statusCode = status ? status : response.statusCode;
        const contentLength = this.getContentLength(body);

        let requestLog = `Res(${id}): "${requestLine}" ${statusCode} ${contentLength}`;

        if (body) {
            requestLog = requestLog.concat("\n", JSON.stringify(body, null, 2));
        }

        this.logger.log(requestLog); 
    }

    private getRequestLine(request: Request) {
        const { method, url, httpVersion, protocol } = request;
        return `${method} ${url} ${protocol.toUpperCase()}/${httpVersion}`;
    }

    private getContentLength(data: any) {
        const type = typeof(data);
        switch(type) {
          case 'string':
            return data.length;
          case 'number':
          case 'boolean':
            return data.toString().length;
          case 'object':
            return JSON.stringify(data).length;
        }
    }
}
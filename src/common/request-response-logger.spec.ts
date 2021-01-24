/* eslint-disable @typescript-eslint/unbound-method */
import "reflect-metadata";
import { Logger } from "@nestjs/common/services/logger.service";
import { RequestResponeLogger } from "./request-response-logger";
import { mocked } from "ts-jest/utils";
import { Request } from "express";

jest.mock("@nestjs/common/services/logger.service");
jest.mock("crypto", () => { return {
    randomBytes: jest.fn().mockImplementation((size) => {
        const numberArray: number[] = [];
        for( let i = 0; i < size; i++) {
            numberArray.push(159);
        }
        return Buffer.from(numberArray);
    })};
});

function createFixtureRequest(options: Partial<Request> = {}): Partial<Request> {
    const defaults = {
        method: 'GET',
        url: '/',
        protocol: 'http',
        httpVersion: '1.1',
        body: {}
    };
    return {...defaults, ...options};
}

describe('RequestResponseLogger', () => {

    const logger: Logger = new Logger();
    const requestResponseLogger = new RequestResponeLogger(logger);

    let request: Partial<Request>;
    
    const response: any = {
        statusCode: 200,
    };

    beforeEach(() => {
        mocked(logger.log).mockReset();
        request = createFixtureRequest();
    });

    describe('logRequest', () => {

        it('should logRequest', () => {

            expect(logger.log).not.toHaveBeenCalled();

            requestResponseLogger.logRequest(request as any);

            expect(logger.log).toHaveBeenCalledWith('Req(9f9f9f9f): "GET / HTTP/1.1"');

        });

        it('should logRequest with body', () => {

            request.body = {hello: "World"};

            expect(logger.log).not.toHaveBeenCalled();

            requestResponseLogger.logRequest(request as any);

            expect(logger.log).toHaveBeenCalledWith(`Req(9f9f9f9f): "GET / HTTP/1.1"\n${JSON.stringify(request.body, null, 0)}`);

        });

    });

    describe('logResponse', () => {

        it('should log no body when body is null', () => {

            expect(logger.log).not.toHaveBeenCalled();

            requestResponseLogger.logResponse(request as any, response, null);

            expect(logger.log).toHaveBeenCalledWith('Res(--------): "GET / HTTP/1.1" 200 0');

        });

        it('should log body when body is a string', () => {

            expect(logger.log).not.toHaveBeenCalled();

            requestResponseLogger.logResponse(request as any, response, 'Test');

            expect(logger.log).toHaveBeenCalledWith('Res(--------): "GET / HTTP/1.1" 200 4\nTest');

        });

        it('should log body when body is a number', () => {

            expect(logger.log).not.toHaveBeenCalled();

            requestResponseLogger.logResponse(request as any, response, 999);

            expect(logger.log).toHaveBeenCalledWith('Res(--------): "GET / HTTP/1.1" 200 3\n999');

        });

        it('should log body when body is a boolean', () => {

            expect(logger.log).not.toHaveBeenCalled();

            requestResponseLogger.logResponse(request as any, response, true);

            expect(logger.log).toHaveBeenCalledWith('Res(--------): "GET / HTTP/1.1" 200 4\ntrue');

        });

        it('should log body when body is an object', () => {

            const body = {hello: "World"};

            expect(logger.log).not.toHaveBeenCalled();

            requestResponseLogger.logResponse(request as any, response, body);

            expect(logger.log).toHaveBeenCalledWith('Res(--------): "GET / HTTP/1.1" 200 17\n' + JSON.stringify(body, null, 0));

        });

        it('should log logging.id when it is defined in request', () => {

            request.logging = { id: "9f9f9f9f"};

            expect(logger.log).not.toHaveBeenCalled();

            requestResponseLogger.logResponse(request as any, response, null);

            expect(logger.log).toHaveBeenCalledWith('Res(9f9f9f9f): "GET / HTTP/1.1" 200 0');

        });

        it('should log status from parameter when it is defined', () => {

            expect(logger.log).not.toHaveBeenCalled();

            requestResponseLogger.logResponse(request as any, response, null, 500);

            expect(logger.log).toHaveBeenCalledWith('Res(--------): "GET / HTTP/1.1" 500 0');

        });

    });

})
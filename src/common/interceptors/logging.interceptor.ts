import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { RequestResponeLogger } from '../request-response-logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {

  private logger = new Logger('RequestLogger');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const http = context.switchToHttp();
    const request: Request = http.getRequest();
    const response: Response = http.getResponse();

    const reqResLogger = new RequestResponeLogger(this.logger);

    reqResLogger.logRequest(request);

    return next
      .handle()
      .pipe(
        tap(
          (data) => {
            reqResLogger.logResponse(request, response, data);
          })
      );
  }

}

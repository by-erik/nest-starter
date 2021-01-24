/* eslint-disable @typescript-eslint/unbound-method */
import { Observable, of } from 'rxjs';
import { mocked } from 'ts-jest/utils';
import { RequestResponeLogger } from '../request-response-logger';
import { LoggingInterceptor } from './logging.interceptor';

jest.mock('../request-response-logger')

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

describe('LoggingInterceptor', () => {

  beforeEach(() => {
    mocked(RequestResponeLogger).mockReset();
  });

  it('should be defined', () => {
    expect(new LoggingInterceptor()).toBeDefined();
  });

  it('should call logRequest and logResponse on RequestResponseLogger', () => {

    const request = 'Request';
    const response = 'Response';

    const context = {
      switchToHttp: (): any => { 
        return {
          getRequest: (): any => request,
          getResponse: (): any => response
        }
      }
    }

    const next = {
      handle: (): Observable<string> => {
        return of('Data');
      }
    }

    const interceptor = new LoggingInterceptor();

    const ob = interceptor.intercept(context as any, next as any);
    ob.subscribe(noop);
    
    const requestResponseLogger = mocked(RequestResponeLogger).mock.instances[0];

    expect(requestResponseLogger.logRequest).toHaveBeenCalledWith(request);   
    expect(requestResponseLogger.logResponse).toHaveBeenCalledWith(request, response, 'Data');

  });

});

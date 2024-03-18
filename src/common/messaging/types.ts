import { DI, Registration, Key } from "@microsoft/fast-foundation";

export interface RawMessage {
  correlationId: string;
}

export interface IRequest {}

export interface IResponse {}

export interface IRequestHandler<
  Request extends IRequest,
  Response extends IResponse
> {
  Handle(request: Request): Response;
}

export const IMediator = DI.createInterface<IMediator>();
export interface IMediator {
  publish(command: string, request: IRequest): IResponse;
}

export const IBus = DI.createInterface<IBus>();
export interface IBus {
  send: (message: any) => void;
  registerHandler: (handler: (message: any) => void) => void;
}

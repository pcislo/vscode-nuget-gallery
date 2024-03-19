export interface RawMessage {
  correlationId: string;
}

export interface IRequest {}

export interface IResponse {}

export interface IRequestHandler<Request extends IRequest, Response extends IResponse> {
  Handle(request: Request): Promise<Response>;
}

export interface IMediator {
  publish(command: string, request: IRequest): Promise<IResponse>;
  addHandler(command: string, handler: IRequestHandler<IRequest, IResponse>): IMediator;
}

export interface IBus {
  send: (message: any) => void;
  receiveCallback: (handler: (message: any) => void, thisArg: any) => void;
}

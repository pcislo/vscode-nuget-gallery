export interface RawMessage {
  correlationId: string;
}

export interface IRequestHandler<Request, Response> {
  HandleAsync(request: Request): Promise<Response>;
}

export interface IMediator {
  PublishAsync<REQ, RES>(command: string, request: REQ): Promise<RES>;
  AddHandler<REQ, RES>(command: string, handler: IRequestHandler<REQ, RES>): IMediator;
}

export interface IBus {
  Send: (message: any) => void;
  ReceiveCallback: (handler: (message: any) => void, thisArg: any) => void;
}

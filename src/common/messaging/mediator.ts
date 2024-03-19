import { IBus, IMediator, IRequest, IRequestHandler, IResponse } from "./types";
import { Mutex, MutexInterface } from "async-mutex";
import nonce from "@/common/nonce";

type HandlersCollection = {
  [command: string]: IRequestHandler<IRequest, IResponse>;
};
type LocksCollection = {
  [correlationId: number]: { release: MutexInterface.Releaser; response?: IResponse };
};

type MessageType = {
  headers: {
    type: "REQUEST" | "RESPONSE";
    command: string;
    correlationId: number;
  };
  body: IRequest;
};

export default class Mediator implements IMediator {
  _bus!: IBus;
  _locks: LocksCollection;
  _handlers: HandlersCollection;

  constructor(bus: IBus) {
    this._locks = {};
    this._handlers = {};
    this._bus = bus;
    this._bus.receiveCallback(this.handleMessage, this);
  }

  addHandler(command: string, handler: IRequestHandler<IRequest, IResponse>): IMediator {
    this._handlers[command] = handler;
    return this;
  }

  async publish(command: string, request: IRequest): Promise<IResponse> {
    let correlationId = nonce();
    let message: MessageType = {
      headers: {
        type: "REQUEST",
        command: command,
        correlationId: correlationId,
      },
      body: request,
    };
    let mutex = new Mutex();
    let release = await mutex.acquire();
    this._locks[correlationId] = { release: release };
    this._bus.send(message);
    await mutex.waitForUnlock();

    let response = this._locks[correlationId].response;
    if (response == undefined) throw "Response not set";

    delete this._locks[correlationId];

    return response;
  }

  handleMessage(message: MessageType) {
    if (message.headers.type == "REQUEST") return this.handleRequest(message);
    else if (message.headers.type == "RESPONSE") return this.handleResponse(message);
    else throw `Message type not recognized: ${message.headers.type}`;
  }

  async handleRequest(message: MessageType) {
    let handler = this._handlers[message.headers.command];
    if (handler == null) throw `No handler registered for command: ${message.headers.command}`;

    let response = await handler.Handle(message.body);
    let returnMessage: MessageType = {
      headers: {
        type: "RESPONSE",
        command: message.headers.command,
        correlationId: message.headers.correlationId,
      },
      body: response,
    };

    this._bus.send(returnMessage);
  }

  async handleResponse(message: MessageType) {
    let lockInfo = this._locks[message.headers.correlationId];
    if (lockInfo == null) throw `No lock info found for correlationId: ${message.headers.correlationId}`;

    lockInfo.response = message.body;
    lockInfo.release();
  }
}

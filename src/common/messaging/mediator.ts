import { inject } from "@microsoft/fast-foundation";
import { IBus, IMediator, IRequest, IResponse } from "./types";
import nonce from "@/common/nonce";

export default class Mediator implements IMediator {
  _bus!: IBus;

  constructor(@inject(IBus) bus: IBus) {
    this._bus = bus;
  }

  publish(command: string, request: IRequest): IResponse {
    let correlationId = nonce();
    this._bus.send({
      headers: {
        command: command,
        correlationId: correlationId,
      },
      body: request,
    });

    return {};
  }
}

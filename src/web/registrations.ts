import { Registration, DI } from "@microsoft/fast-foundation";
import * as types from "@/common/messaging/core/types";
import WebBus from "./messaging/web-bus";
import Mediator from "@/common/messaging/core/mediator";

export const IMediator = DI.createInterface<types.IMediator>();
export type IMediator = types.IMediator;

export default function () {
  return [Registration.instance(IMediator, new Mediator(new WebBus()))];
}

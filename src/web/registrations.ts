import { Registration } from "@microsoft/fast-foundation";
import { IBus, IMediator } from "@/common/messaging/types";
import WebBus from "./messaging/web-bus";
import Mediator from "@/common/messaging/mediator";

export default function () {
  return [
    Registration.singleton(IBus, WebBus),
    Registration.transient(IMediator, Mediator),
  ];
}

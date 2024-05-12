import { Registration, DI } from "@microsoft/fast-foundation";
import * as types from "@/common/messaging/core/types";
import WebBus from "./messaging/web-bus";
import Mediator from "@/common/messaging/core/mediator";
import { SHOW_SETTINGS } from "@/common/messaging/core/commands";
import ShowSettings from "@/host/handlers/show-settings";
import RouterType from "./router";
import ConfigurationService from "./configuration";

export const IMediator = DI.createInterface<types.IMediator>();
export type IMediator = types.IMediator;

export const Router = DI.createInterface<RouterType>();
export type Router = RouterType;

export const Configuration = DI.createInterface<ConfigurationService>();
export type Configuration = ConfigurationService;

let mediator = new Mediator(new WebBus());
let router = new RouterType();
let configuration = new ConfigurationService(mediator);

mediator.AddHandler(SHOW_SETTINGS, new ShowSettings(router));

export default function () {
  return [
    Registration.instance(IMediator, mediator),
    Registration.instance(Router, router),
    Registration.instance(Configuration, configuration),
  ];
}

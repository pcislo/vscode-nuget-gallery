import { IMediator } from "./registrations";
import { GET_CONFIGURATION } from "@/common/messaging/core/commands";
import { Observable } from "@microsoft/fast-element";

export default class ConfigurationService {
  private mediator: IMediator;
  private configuration: Configuration | null = null;

  constructor(mediator: IMediator) {
    this.mediator = mediator;
  }

  get Configuration() {
    Observable.track(this, "Configuration");
    return this.configuration;
  }

  async Reload() {
    let response = await this.mediator.PublishAsync<
      GetConfigurationRequest,
      GetConfigurationResponse
    >(GET_CONFIGURATION, {});

    this.configuration = response.Configuration;
    console.log("CONFIG", this.configuration);
    Observable.notify(this, "Configuration");
  }
}

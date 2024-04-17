import { IRequestHandler } from "@/common/messaging/core/types";
import Router from "@/web/router";

export default class ShowSettings
  implements IRequestHandler<ShowSettingsRequest, ShowSettingsResponse>
{
  private router: Router;
  constructor(router: Router) {
    this.router = router;
  }

  async HandleAsync(request: ShowSettingsRequest): Promise<ShowSettingsResponse> {
    this.router.Navigate("SETTINGS");
    return {};
  }
}

import { Observable } from "@microsoft/fast-element";

type Routes = "BROWSE" | "SETTINGS";

export default class Router {
  private route: Routes = "BROWSE";

  get CurrentRoute() {
    Observable.track(this, "CurrentRoute");
    return this.route;
  }

  Navigate(route: Routes) {
    this.route = route;
    Observable.notify(this, "CurrentRoute");
  }
}

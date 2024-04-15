import { Observable } from "@microsoft/fast-element";

export default class ObservableDictionary<T> {
  private internal: { [id: string]: T } = {};

  Add(id: string, obj: T) {
    this.internal[id] = obj;
    Observable.notify(this, id);
  }

  Remove(id: string) {
    delete this.internal[id];
    Observable.notify(this, id);
  }

  Get(id: string): T | undefined {
    Observable.track(this, id);
    return id in this.internal ? this.internal[id] : undefined;
  }
}

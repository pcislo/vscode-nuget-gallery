import { Mutex } from "async-mutex";
import * as vscode from "vscode";

class TaskExecutor {
  private globalMutex: Mutex = new Mutex();

  async ExecuteTask(task: vscode.Task): Promise<void> {
    let releaser = await this.globalMutex.acquire();
    let mutex = new Mutex();
    mutex.acquire();
    let execution = await vscode.tasks.executeTask(task);
    let callback = vscode.tasks.onDidEndTask((x) => {
      if (x.execution.task == execution.task) mutex.release();
    });
    await mutex.waitForUnlock();
    releaser();
    callback.dispose();
  }
}

export default new TaskExecutor();

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { Logger } from './logger';
import { TaskRunner } from './task_runner';

interface Opts {
  totalCapacity: number;
  logger: Logger;
}

/**
 * Runs tasks in batches, taking costs into account.
 *
 * @export
 * @class TaskPool
 */
export class TaskPool {
  private totalCapacity: number;
  private running = new Set<TaskRunner>();
  private logger: Logger;

  /**
   * Creates an instance of TaskPool.
   *
   * @param {Opts} opts
   * @prop {number} totalCapacity - The total number of workers / work slots available
   * @prop {Logger} logger - The task manager logger.
   * @memberof TaskPool
   */
  constructor(opts: Opts) {
    this.totalCapacity = opts.totalCapacity;
    this.logger = opts.logger;
  }

  /**
   * Gets how many workers are currently in use.
   */
  get occupiedWorkers() {
    let total = 0;

    this.running.forEach(({ numWorkers }) => (total += numWorkers));

    return total;
  }

  /**
   * Gets how many workers are currently available.
   */
  get availableWorkers() {
    return this.totalCapacity - this.occupiedWorkers;
  }

  /**
   * Attempts to run the specified list of tasks. Returns true if it was able
   * to start every task in the list, false if there was not enough capacity
   * to run every task.
   *
   * @param {TaskRunner[]} tasks
   * @returns {Promise<boolean>}
   * @memberof TaskPool
   */
  public run = (tasks: TaskRunner[]) => {
    this.cancelExpiredTasks();
    return this.checkForWork(tasks);
  };

  private async checkForWork(tasks: TaskRunner[]) {
    for (const task of tasks) {
      if (this.availableWorkers < task.numWorkers) {
        return false;
      }

      if (await task.claimOwnership()) {
        this.running.add(task);
        task
          .run()
          .catch(error => {
            this.logger.warning(`Task ${task} failed: ${error.stack}`);
          })
          .then(() => this.running.delete(task));
      }
    }

    return true;
  }

  private cancelExpiredTasks() {
    for (const task of this.running) {
      if (task.isExpired) {
        this.cancelTask(task);
      }
    }
  }

  private async cancelTask(task: TaskRunner) {
    try {
      this.logger.debug(`Cancelling expired task ${task}.`);
      this.running.delete(task);
      await task.cancel();
    } catch (error) {
      this.logger.error(`Failed to cancel task ${task}: ${error.stack}`);
    }
  }
}

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

import { fillPool } from './fill_pool';
import { TaskManagerLogger } from './logger';
import { ConcreteTaskInstance, SanitizedTaskDefinition, TaskDictionary } from './task';
import { TaskManager } from './task_manager';
import { TaskPoller } from './task_poller';
import { TaskPool } from './task_pool';
import { TaskManagerRunner } from './task_runner';
import { TaskStore } from './task_store';

export async function getDefaultClient(
  kbnServer: any,
  server: any,
  config: any,
  logger: TaskManagerLogger,
  maxWorkers: number,
  definitions: TaskDictionary<SanitizedTaskDefinition>
): Promise<TaskManager> {
  const callCluster = server.plugins.elasticsearch.getCluster('admin').callWithInternalUser;
  const store = new TaskStore({
    index: config.get('taskManager.index'),
    callCluster,
    maxAttempts: config.get('taskManager.max_attempts'),
    supportedTypes: Object.keys(definitions),
  });

  logger.debug('Initializing the task manager index');
  await store.init();

  const pool = new TaskPool({
    logger,
    maxWorkers,
  });

  const contextProvider = async (taskInstance: ConcreteTaskInstance) => ({
    callCluster,
    kbnServer,
    taskInstance,
  });

  const poller = new TaskPoller({
    logger,
    pollInterval: config.get('taskManager.poll_interval'),
    work: () =>
      fillPool(
        pool.run,
        store.fetchAvailableTasks,
        (instance: ConcreteTaskInstance) =>
          new TaskManagerRunner({
            logger,
            definition: definitions[instance.taskType],
            instance,
            store,
            contextProvider,
          })
      ),
  });

  poller.start();

  return new TaskManager({ store, poller });
}

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

import Joi from 'joi';
import { TaskManagerClientWrapper } from './client_wrapper';
import { getDefaultClient } from './default_client';
import { TaskManagerLogger } from './logger';
import {
  SanitizedTaskDefinition,
  TaskDefinition,
  TaskDictionary,
  validateTaskDefinition,
} from './task';

export async function taskManagerMixin(kbnServer: any, server: any, config: any) {
  const logger = new TaskManagerLogger((...args: any[]) => server.log(...args));
  const totalCapacity = config.get('taskManager.num_workers');
  const definitions = extractTaskDefinitions(totalCapacity, kbnServer.uiExports.taskDefinitions);

  server.decorate('server', 'taskManager', new TaskManagerClientWrapper());

  kbnServer.afterPluginsInit(async () => {
    const client = await getDefaultClient(
      kbnServer,
      server,
      config,
      logger,
      totalCapacity,
      definitions
    );
    server.taskManager.setClient(client);
  });
}

// TODO, move this to a file and properly test it, validate the taskDefinition via Joi or something
function extractTaskDefinitions(
  numWorkers: number,
  taskDefinitions: TaskDictionary<TaskDefinition> = {}
): TaskDictionary<SanitizedTaskDefinition> {
  return Object.keys(taskDefinitions).reduce(
    (acc, type) => {
      const rawDefinition = taskDefinitions[type];
      rawDefinition.type = type;
      const definition = Joi.attempt(rawDefinition, validateTaskDefinition) as TaskDefinition;
      const workersOccupied = Math.min(numWorkers, definition.numWorkers || 1);

      acc[type] = {
        ...definition,
        numWorkers: workersOccupied,
      };

      return acc;
    },
    {} as TaskDictionary<SanitizedTaskDefinition>
  );
}

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Joi from 'joi';

interface ESQueryRuleParams {
  name: string;
  query: strin;
  indexPattern: string;
  searchLastMinutes: number;
}

export class RulesService {
  private kbnServer: any;
  private taskManager: TaskManager;

  constructor(kbnServer: any) {
    this.kbnServer = kbnServer;

    const server = this.kbnServer.server;
    server.route({
      method: 'GET',
      path: '/api/siem_rules/tasks',
      handler: async () => {
        return await this.getTasks();
      },
    });

    server.route({
      method: 'POST',
      path: '/api/siem_rules/schedule',
      config: {
        validate: {
          payload: Joi.object({
            name: Joi.string().required(),
            query: Joi.string().required(),
            indexPattern: Joi.string()
              .allow('', null)
              .default('auditbeat-*'),
            searchLastMinutes: Joi.number()
              .allow(null)
              .default(5),
          }).required(),
        },
      },
      handler: async (request: any) => {
        this.info(`Request payload: ${request.payload}`);
        return await this.scheduleRule(request.payload);
      },
    });

    server.route({
      method: 'POST',
      path: '/api/siem_rules/remove/{taskID}',
      config: {
        validate: {
          params: Joi.object().keys({
            taskID: Joi.string().required(),
          }),
        },
      },
      handler: async (request: any) => {
        return await this.taskManager.remove(request.params.taskID);
      },
    });

    server.route({
      method: 'POST',
      path: '/api/siem_rules/removeAll',
      handler: async (request: any) => {
        const tasks: object[] = await this.getTasks();
        tasks.forEach(task => {
          this.taskManager.remove(task.id);
        });
        return { ack: true };
      },
    });

    this.taskManager = server.taskManager;
    this.addTasksDefinition();
  }

  public async getTasks(): object[] {
    const { docs } = await this.taskManager.fetch({
      query: {
        match: {
          ['task.scope']: 'siem_rules',
        },
      },
    });

    return docs.map(t => {
      return {
        id: t.id,
        runAt: t.runAt,
        interal: t.interval,
        params: t.params,
      };
    });
  }

  public async scheduleRule(payload: ESQueryRuleParams) {
    this.info(`scheduling task ${payload.name}`);
    return await this.taskManager.schedule({
      taskType: 'siemRuleQuery',
      runAt: new Date(),
      interval: '1m',
      scope: 'siem_rules',
      params: {
        payload: payload,
      },
    });
  }

  private addTasksDefinition() {
    const task = {
      title: `SIEM rules: query`,
      description: 'Test SIEM rule',
      timeOut: '5m',
      numWorkers: 1,
      createTaskRunner(context: RunContext) {
        return {
          async run() {
            const { name, query } = context.taskInstance.params.payload;
            context.kbnServer.server.log(
              ['info', 'siem-rules-service'],
              `Task runnning: ${name}. Query: ${query}`
            );
          },

          async cancel() {
            context.kbnServer.server.log(['info', 'siem-rules-service'], 'Task canceling');
          },
        };
      },
    };
    this.taskManager.registerTaskDefinitions({
      siemRuleQuery: task,
    });
    this.info('task definition registered');
  }

  private info(message: string) {
    this.kbnServer.server.log(['info', 'siem-rules-service'], message);
  }
}

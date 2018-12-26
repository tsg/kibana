/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import nodeCrypto from '@elastic/node-crypto';
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
  private crypto: any;

  constructor(kbnServer: any) {
    this.kbnServer = kbnServer;
    const server = this.kbnServer.server;
    this.kbnServer.crypto = cryptoFn(server);

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
        return await this.scheduleRule(request.payload, request.headers);
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

  public async scheduleRule(payload: ESQueryRuleParams, headers: any[]) {
    this.info('schedule Headers: ' + JSON.stringify(headers));
    const encryptedHeaders = await this.kbnServer.crypto.encrypt(JSON.stringify(headers));
    this.info('encryptedHeaders: ' + encryptedHeaders);
    this.info(`scheduling task ${payload.name}`);
    return await this.taskManager.schedule({
      taskType: 'siemRuleQuery',
      runAt: new Date(),
      interval: '1m',
      scope: 'siem_rules',
      params: {
        payload,
        encryptedHeaders,
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
            const payload: ESQueryRuleParams = context.taskInstance.params.payload;
            context.kbnServer.server.log(
              ['info', 'siem-rules-service'],
              `Task runnning: ${payload.name}. Query: ${payload.query}`
            );

            const { callWithRequest } = context.kbnServer.server.plugins.elasticsearch.getCluster(
              'data'
            );
            const req = await getRequestContext(
              context.taskInstance.params.encryptedHeaders,
              context.kbnServer,
              ''
            );

            const result = await callWithRequest(req, 'search', {
              index: payload.indexPattern,
              ignoreUnavailable: true,
              q: payload.query,
            });
            context.kbnServer.server.log(
              ['info', 'siem-rules-service'],
              `Result: ` + JSON.stringify(result)
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

function cryptoFn(server) {
  const encryptionKey = server.config().get('xpack.security.encryptionKey');
  return nodeCrypto({ encryptionKey });
}

async function getRequestContext(encryptedHeaders: string, kbnServer: any, basepath: string) {
  const headers = await kbnServer.crypto.decrypt(encryptedHeaders);

  const server: KbnServer = kbnServer.server;
  const serverBasePath: string = server.config().get('server.basePath');

  const fakeRequest: any = {
    headers: JSON.parse(headers),
    // This is used by the spaces SavedObjectClientWrapper to determine the existing space.
    // We use the basePath from the saved job, which we'll have post spaces being implemented;
    // or we use the server base path, which uses the default space
    getBasePath: () => basePath || serverBasePath,
  };

  if (server.plugins.security) {
    const { authorization } = server.plugins.security;
    await authorization.mode.initialize(fakeRequest);
  }

  return fakeRequest;
}

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import Joi from 'joi';

const APP_ID = 'siem_rules';
const ROOT = '/api/siem_rules'

export function siemRules(kibana) {
  return new kibana.Plugin({
    id: APP_ID,
    require: ['elasticsearch', 'task_manager'],

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    init(server) {
      initRoutes(server);
    }
  });
}


export function initRoutes(server) {
  const { taskManager } = server;

  server.route({
    path: `${ROOT}/tasks`,
    method: 'GET',
    async handler() {
      try {
        return taskManager.fetch();
      } catch (err) {
        return err;
      }
    }
  });

  server.route({
    path: `${ROOT}/tasks/start`,
    method: 'POST',
    async handler(request) {
      try {
        const task = await taskManager.schedule();
        return task
        return task;
      } catch (err) {
        return err;
      }
    }
  });
}


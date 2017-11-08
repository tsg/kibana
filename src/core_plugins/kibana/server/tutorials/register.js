import { systemSpecProvider } from './system';
import { apacheSpecProvider } from './apache';
import { nginxSpecProvider } from './nginx';
import { mysqlSpecProvider } from './mysql';

export function registerTutorials(server) {
  server.registerTutorial(systemSpecProvider);
  server.registerTutorial(apacheSpecProvider);
  server.registerTutorial(nginxSpecProvider);
  server.registerTutorial(mysqlSpecProvider);
}

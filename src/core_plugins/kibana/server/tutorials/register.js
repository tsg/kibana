import { systemLogsSpecProvider } from './systemLogs';
import { apacheLogsSpecProvider } from './apacheLogs';
import { apacheMetricsSpecProvider } from './apacheMetrics';
import { nginxLogsSpecProvider } from './nginxLogs';
import { mysqlLogsSpecProvider } from './mysqlLogs';

export function registerTutorials(server) {
  server.registerTutorial(systemLogsSpecProvider);
  server.registerTutorial(apacheLogsSpecProvider);
  server.registerTutorial(apacheMetricsSpecProvider);
  server.registerTutorial(nginxLogsSpecProvider);
  server.registerTutorial(mysqlLogsSpecProvider);
}

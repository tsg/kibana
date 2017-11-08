import { TUTORIAL_CATEGORY } from '../../../common/tutorials/tutorial_category';
import { INSTRUCTION_VARIANT } from '../../../common/tutorials/instruction_variant';

export function systemSpecProvider() {
  return {
    id: 'system',
    name: 'System logs',
    category: TUTORIAL_CATEGORY.LOGGING,
    shortDescription: 'This module parses logs written by the local Syslog server.',
    longDescription: 'This module collects and parses logs created by the system logging service of common' +
                     ' Unix/Linux based distributions. This module is not available on Windows.' +
                     ' You can read more about the Filebeat System module in the [documentation].',
    //iconPath: '', TODO
    completionTimeMinutes: 10,
    //previewImagePath: '', TODO
    instructionSets: [
      {
        title: 'Getting Started',
        instructionVariants: [
          {
            id: INSTRUCTION_VARIANT.OSX,
            instructions: [
              {
                title: 'Download and install Filebeat',
                textPre: 'Download and install Filebeat by running the commands below.' +
                         ' Skip this step if you already have Filebeat installed.' +
                         ' If you are installing Filebeat for the first time, we recommend reading the [Getting Started]' +
                         ' guide in the online documentation',
                commands: [
                  'curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-{config.kibana.version}-darwin-x86_64.tar.gz',
                  'tar xzvf filebeat-{config.kibana.version}-darwin-x86_64.tar.gz'
                ],
                textPost: 'Edit the `filebeat-{config.kibana.version}-darwin-x86_64/filebeat.yml` file and ' +
                           'adjust the `output.elasticsearch` settings if needed.'
              },
              {
                title: 'Enable and configure the System module',
                textPre: 'In the Filebeat install directory, run the following commands to enable the System module.',
                commands: [
                  './filebeat modules enable system',
                ],
                textPost: 'Optional: Modify the module settings in the `modules.d/system.yml` file.'
              },
              {
                title: 'Start Filebeat',
                textPre: 'Setup the Kibana dashboards and start Filebeat with the following commands.' +
                         ' Skip this step if you already have Filebeat installed.',
                commands: [
                  './filebeat -e --setup',
                ],
                textPost: 'The `--setup` flag loads the Kibana dashboards. If the dashboards are already setup, ' +
                          'you don\'t need to use this flag.'
              }
            ]
          },
          {
            id: INSTRUCTION_VARIANT.DEB,
            instructions: [
              {
                title: 'Download and install Filebeat',
                textPre: 'Download and install Filebeat by running the commands below.' +
                         ' Skip this step if you already have Filebeat installed.' +
                         ' If you are installing Filebeat for the first time, we recommend reading the [Getting Started]' +
                         ' guide in the online documentation',
                commands: [
                  'curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-{config.kibana.version}-amd64.deb',
                  'sudo dpkg -i filebeat-{config.kibana.version}-amd64.deb'
                ],
                textPost: 'Edit the `/etc/filebeat/filebeat.yml` file and ' +
                           'adjust the `output.elasticsearch` settings if needed.'
              },
              {
                title: 'Enable and configure the System module',
                textPre: 'Run the following commands to enable the System module.',
                commands: [
                  'sudo filebeat modules enable system',
                ],
                textPost: 'Optional: Modify the module settings in the `/etc/filebeat/modules.d/system.yml` file.'
              },
              {
                title: 'Start Filebeat',
                textPre: 'Setup the Kibana dashboards and start Filebeat with the following commands.',
                commands: [
                  'sudo filebeat setup -e',
                  'sudo service filebeat start',
                ],
                textPost: 'The `setup` command loads the Kibana dashboards. If the dashboards are already installed, ' +
                          'you don\'t need to run it again.'
              }
            ]
          },
          {
            id: INSTRUCTION_VARIANT.RPM,
            instructions: [
              {
                title: 'Download and install Filebeat',
                textPre: 'Download and install Filebeat by running the commands below.' +
                         ' Skip this step if you already have Filebeat installed.' +
                         ' If you are installing Filebeat for the first time, we recommend reading the [Getting Started]' +
                         ' guide in the online documentation',
                commands: [
                  'curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-{config.kibana.version}-x86_64.rpm',
                  'sudo rpm -vi filebeat-{config.kibana.version}-x86_64.rpm'
                ],
                textPost: 'Edit the `/etc/filebeat/filebeat.yml` file and ' +
                           'adjust the `output.elasticsearch` settings if needed.'
              },
              {
                title: 'Enable and configure the System module',
                textPre: 'Run the following commands to enable the System module.',
                commands: [
                  'sudo filebeat modules enable system',
                ],
                textPost: 'Optional: Modify the module settings in the `/etc/filebeat/modules.d/system.yml` file.'
              },
              {
                title: 'Start Filebeat',
                textPre: 'Setup the Kibana dashboards and start Filebeat with the following commands.',
                commands: [
                  'sudo filebeat setup -e',
                  'sudo service filebeat start',
                ],
                textPost: 'The `setup` command loads the Kibana dashboards. If the dashboards are already installed, ' +
                          'you don\'t need to run it again.'
              }
            ]
          }
        ]
      }
    ]
  };
}

import Mustache from 'mustache';
import { metadata } from 'ui/metadata';
import {
  DOC_LINK_VERSION,
  ELASTIC_WEBSITE_URL,
  documentationLinks
} from 'ui/documentation_links/documentation_links';

const TEMPLATE_TAGS = ['{', '}'];

export function replaceTemplateStrings(text) {
  const variables = {
    config: {
      docs: {
        base_url: ELASTIC_WEBSITE_URL,
        beats: {
          filebeat: documentationLinks.filebeat.base,
          metricbeat: documentationLinks.metricbeat.base
        },
        version: DOC_LINK_VERSION
      },
      kibana: {
        version: metadata.version
      }
    }
  };
  Mustache.parse(text, TEMPLATE_TAGS);
  return Mustache.render(text, variables);
}

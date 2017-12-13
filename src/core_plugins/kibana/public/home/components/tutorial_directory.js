import React from 'react';
import PropTypes from 'prop-types';
import { Synopsis } from './synopsis';
import {
  KuiTabs,
  KuiTab,
  KuiFlexItem,
  KuiFlexGrid,
} from 'ui_framework/components';
import { getTutorials } from '../tutorials';

const ALL = 'all';

export class TutorialDirectory extends React.Component {

  constructor(props) {
    super(props);

    this.tabs = [{
      id: ALL,
      name: 'All',
    }, {
      id: 'logging',
      name: 'Logging',
    }, {
      id: 'metrics',
      name: 'Merics',
    }, {
      id: 'security',
      name: 'Security Analytics',
    }];

    let openTab = ALL;
    if (props.openTab && this.tabs.some(tab => { return tab.id === props.openTab; })) {
      openTab = props.openTab;
    }
    this.state = {
      selectedTabId: openTab,
      tutorials: []
    };
  }

  async componentWillMount() {
    const tutorials = await getTutorials();
    this.setState({
      tutorials: tutorials,
    });
  }

  onSelectedTabChanged = id => {
    this.setState({
      selectedTabId: id,
    });
  };

  renderTabs = () => {
    return this.tabs.map((tab, index) => (
      <KuiTab
        className="homeDirectoryTab"
        onClick={() => this.onSelectedTabChanged(tab.id)}
        isSelected={tab.id === this.state.selectedTabId}
        key={index}
      >
        {tab.name}
      </KuiTab>
    ));
  }

  renderTutorials = () => {
    return this.state.tutorials
      .filter((tutorial) => {
        if (this.state.selectedTabId === ALL) {
          return true;
        }
        return this.state.selectedTabId === tutorial.category;
      })
      .map((tutorial) => {
        return (
          <KuiFlexItem key={tutorial.name}>
            <Synopsis
              description={tutorial.shortDescription}
              title={tutorial.name}
              url={this.props.addBasePath(`#/home/tutorial/${tutorial.id}`)}
            />
          </KuiFlexItem>
        );
      });
  };

  render() {
    return (
      <div className="kuiView home">
        <div className="kuiViewContent">

          <div className="kuiViewContentItem kuiVerticalRhythmXLarge">
            <h1 className="kuiTitle ">
              Add Data to Kibana
            </h1>
          </div>

          <div className="kuiViewContentItem kuiVerticalRhythmXLarge">
            <KuiTabs>
              {this.renderTabs()}
            </KuiTabs>
            <KuiFlexGrid columns={4} className="homeDirectory">
              <KuiFlexItem>
                <Synopsis
                  description="Is your data already in Elastic Search? Set up an Index Pattern to quickly query it."
                  title="Set up an Index Pattern"
                  url={this.props.addBasePath('/app/kibana#/management/kibana/index')}
                />
              </KuiFlexItem>
              { this.renderTutorials() }
            </KuiFlexGrid>
          </div>

        </div>
      </div>
    );
  }
}

TutorialDirectory.propTypes = {
  addBasePath: PropTypes.func.isRequired,
  openTab: PropTypes.string
};

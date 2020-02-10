import React from 'react';
import {Transition, TransitionGroup} from 'react-transition-group';
import PropTypes from 'prop-types';

function cssState(e, p) {
  if (p) {
    e.style.position = 'relative';  
    e.style.left = e.style.top = e.style.right = 'auto';
    e.style.zIndex = 1;
  } else {
    e.style.position = 'absolute'; 
    e.style.left = e.style.top = e.style.right = 0;
    e.style.zIndex = 0;
  }
}

class FadeTransition extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    duration: PropTypes.number,
    style: PropTypes.object,
  };
  static defaultProps = {
    duration: 500,
    style: {},
  };
  constructor(props) {
    super(props);
    this.elmStyle = Object.assign({}, this.props.style);
    this.elmStyle.overflow = 'hidden';
    this.elmStyle.transition = 'opacity ' + this.props.duration + 'ms ease-in-out';
    this.exitElements = [];
  }
  render() {
    return (
      <TransitionGroup style={{position: 'relative'}}>
        <Transition
          onExit={(e) => {
            e.style.opacity = 1;
            this.exitElements.push(e);
          }} 
          onExiting={(e) => {
            e.style.opacity = 0.01;
          }}
          onEnter={(e) => {
            e.style.opacity = 0.01;
            cssState(e, 0);
            const func = (elm) => {
              e.style.opacity = 1;
              if (e.getElementsByClassName('loading-indicator').length) {
                setTimeout(func, 100);
              } else {
                cssState(e, 1);
                while ((elm = this.exitElements.pop())) cssState(elm, 0);
              }
            };
            setTimeout(func, 30);
          }}
          onEntered={(e) => {
            cssState(e, 1);
          }}
          key={this.props.id} timeout={this.props.duration}>
          <div {...this.props} style={this.elmStyle} duration={undefined}>
            {this.props.children}
          </div>
        </Transition>
      </TransitionGroup>
    );
  }
}

export default FadeTransition;
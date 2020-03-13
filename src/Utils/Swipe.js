import React from 'react';
import PropTypes from 'prop-types';
import {cn} from '.';

export default class Swipe extends React.Component {
  static propTypes = {
    onLeft: PropTypes.func, onRight: PropTypes.func, onClick: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {active: ''};
    this.lockMouseEvents = false; 
    this.touchStart = this.touchStart.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.deactivate = this.deactivate.bind(this);
  }
  touchStart(e) {
    this.lockMouseEvents = true;
    this.startX = this.endX = e.touches[0].clientX;
    this.setState({active: 'active'});
  }
  mouseDown(e) {
    if (this.lockMouseEvents) return;
    this.startX = this.endX = e.clientX;
    this.setState({active: 'active'});
  }
  touchMove(e) {
    this.endX = e.touches[0].clientX;
  }
  mouseMove(e) {
    if (this.lockMouseEvents) return;
    this.endX = e.clientX;
  }
  touchEnd(e) {
    if (this.props.onLeft && (this.endX < (this.startX - 50))) {
      this.props.onLeft(e);
    } else if (this.props.onRight && (this.endX > (this.startX + 50))) {
      this.props.onRight(e);
    } else if (this.props.onClick && (this.endX === this.startX)) {
      this.props.onClick(e);
    }
    this.deactivate();
  }
  mouseUp(e) {
    if (!this.lockMouseEvents) this.touchEnd(e);
    this.lockMouseEvents = false;
  }
  deactivate() {
    this.setState({active: ''});
  }
  render() {
    return (
      <div style={this.props.style}
        className={cn(this.props.className, this.state.active)}
        onTouchStart={this.touchStart} onMouseDown={this.mouseDown} 
        onTouchMove={this.touchMove} onMouseMove={this.mouseMove}
        onTouchEnd={this.touchEnd} onMouseUp={this.mouseUp}
        onTouchCancel={this.deactivate} onMouseLeave={this.deactivate}>
        {this.props.children}
      </div>
    );
  }
}
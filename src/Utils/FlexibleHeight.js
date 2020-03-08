import React from 'react';
import PropTypes from 'prop-types';

class FlexibleHeight extends React.Component {
  static propTypes = {
    duration: PropTypes.number,
    onContentChange: PropTypes.func,
    onResizeEnd: PropTypes.func
  };
  static defaultProps = {
    duration: 200
  };
  constructor(props) {
    super(props);
    this.wrapper = React.createRef();
    this.content = React.createRef();
    this.height = 0;
    this._ahTmOut = null;
    this.resizeEnd = this.resizeEnd.bind(this);
    this._adjustHeight = this._adjustHeight.bind(this);
    this.adjustHeight = this.adjustHeight.bind(this);
    this.adjustHeightDelayed = this.adjustHeightDelayed.bind(this);
    this.setEnabled = this.setEnabled.bind(this);
  }
  resizeEnd(e) {
    if (this.props.onResizeEnd && e.target === this.wrapper.current) {
      this.props.onResizeEnd(this.height);
    }
  }
  _adjustHeight() {
    if (!this.content.current) return;
    const height = this.content.current.offsetHeight, resizeStart = height !== this.height;
    if (resizeStart) {
      this.height = height;
      this.wrapper.current.style.height = this.height + 'px';
    } 
    if (this.props.onContentChange) this.props.onContentChange(resizeStart);
  }
  adjustHeight() {
    clearTimeout(this._ahTmOut);
    this._ahTmOut = setTimeout(this._adjustHeight, 50);
  }
  adjustHeightDelayed() {
    clearTimeout(this._ahTmOut);
    this._ahTmOut = setTimeout(this._adjustHeight, 500);
  }
  setEnabled(enabled) {
    if (enabled) {
      this.mutationObserver.observe(this.content.current, { 
        attributes: true, characterData: true, childList: true, subtree: true 
      });
      window.addEventListener('resize', this.adjustHeightDelayed);
      window.addEventListener('orientationchange', this.adjustHeightDelayed);
      this.wrapper.current.addEventListener('transitionend', this.resizeEnd);
      this.adjustHeight();
    } else {
      this.mutationObserver.disconnect();
      window.removeEventListener('resize', this.adjustHeightDelayed);
      window.removeEventListener('orientationchange', this.adjustHeightDelayed);
      this.wrapper.current.removeEventListener('transitionend', this.resizeEnd);
    }
  }
  componentDidMount() {
    this.mutationObserver = new MutationObserver((mutationsList) => {
      this.adjustHeight();
      if (!mutationsList.find((o) => o.type === 'childList')) return;
      if (!this.content.current) return;
      let ar = this.content.current.getElementsByTagName('img');
      for (let i = 0; i < ar.length; i++) {
        if (ar[i].getAttribute('enumerated')) break;
        ar[i].addEventListener('load', this.adjustHeight);
        ar[i].addEventListener('error', this.adjustHeight);
        ar[i].setAttribute('enumerated', 1);
      }
    });
    this.setEnabled(true);
  }
  componentWillUnmount() {
    this.setEnabled(false);
  }
  render() {
    return (
      <div ref={this.wrapper} style={{overflow: 'hidden',
        transition: 'height '+ Math.max(1, this.props.duration) +'ms ease-out'}}>
        <div ref={this.content}>{this.props.children}</div>
      </div>
    );
  }
}

export default FlexibleHeight;
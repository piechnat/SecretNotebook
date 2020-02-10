import React from 'react';
import PropTypes from 'prop-types';
import {selectDialog} from '.';

export default class QuickSelect extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired
  };
  constructor(props) {
    super(props);
    this.valueList = [];
    this.textList = [];
    this.state = {value: '', size: undefined};
    this.defIndex = -1;
    this.dataObject = {name: props.name};
  }
  componentDidMount() {
    this.componentDidUpdate({}, {});
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.children !== prevProps.children) {
      this.valueList = [];
      this.textList = [];
      let textSize = 0;
      React.Children.forEach(this.props.children, (child) => {
        if (child && child.type === 'option') {
          this.valueList.push(String(child.props.value));
          this.textList.push(String(child.props.children));
          textSize = Math.max(textSize, this.textList[this.textList.length-1].length);
        }
      });
      this.setState({size: textSize > 0 ? textSize : undefined});
    }
    if (this.props.value !== prevProps.value) {
      this.defIndex = this.valueList.indexOf(String(this.props.value));
      this.setState({value: this.textList[Math.max(0, this.defIndex)]});
    }
  }
  inputClick = (e) => {
    selectDialog(this.textList, this.defIndex).then((result) => {
      if (result !== this.defIndex) {
        this.defIndex = result;
        if (result > -1 && this.props.onChange) {
          this.dataObject.value = this.valueList[result];
          this.props.onChange(this.dataObject);
        }
      }
    });
  }
  render() {
    return (
      <input 
        className={this.props.className} 
        style={{...this.props.style, cursor: 'default'}}
        size={this.state.size}
        type="text" value={this.state.value} 
        onClick={this.inputClick} 
        readOnly 
      />
    );
  }
}
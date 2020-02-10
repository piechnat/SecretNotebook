import React from 'react';
import PropTypes from 'prop-types';
import QuickSelect from './QuickSelect';

export default class LessonLengthSelect extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired
  };
  constructor(props) {
    super(props);
    this.values = [15, 22.5, 30, 37.5, 45, 60, 75, 90];
    let {value, onChange, ...propsRest} = props;
    this.propsRest = propsRest;
    this.state = {length: value > 0 ? value : 45};
    this.dataObject = {name: props.name};
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.value !== prevProps.value) {
      this.setState({length: this.props.value});
    }
  }
  inputChange = (data) => {
    let val = parseFloat(data.value);
    this.setState({length: val});
    this.dataObject.value = val;
    this.props.onChange(this.dataObject);
  }
  render() {
    return (
      <QuickSelect onChange={this.inputChange} {...this.propsRest}
        value={this.state.length}>
        {this.values.map((value, index) =>
          <option key={index} value={value}>{value}</option>
        )}
      </QuickSelect>
    );
  }
}
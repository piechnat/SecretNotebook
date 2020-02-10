import React from 'react';
import PropTypes from 'prop-types';
/*
Example of usage:
  dateFmt(new Date(), 'T, D. N (DD-MM-RRRR), $Godzina GG:II:SS')
*/
export function dateFmt(d, f, html) {
  if (!(d instanceof Date)) d = new Date(d);
  (function tmpFunc(c, n, l) {
    let s = (d['get' + n]() + (l || 0)).toString();
    f = f.replace(new RegExp('(^|[^$])(' + c + '+)', 'g'), (m, a, b) => 
      a + (b.replace(/./g, '0') + s).slice(-Math.max(b.length, s.length))); 
    return tmpFunc;
  })('R','FullYear')('M','Month',1)('D','Date')('G','Hours')('I','Minutes')('S','Seconds');
  let N = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 
    'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
    let T = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']; 
  f = f.replace(/(^|[^$])(N+)/g, (m, a) => a + N[d.getMonth()]);
  f = f.replace(/(^|[^$])(T+)/g, (m, a) => a + T[d.getDay()]);
  f = f.replace(/(\$)([^$])/g, '$2');
  return (!html) ? f : <span dangerouslySetInnerHTML={{__html:f}}></span>;
}

class DateTimeField extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired
  };
  constructor(props) {
    super(props);
    this.dateRef = React.createRef();
    this.timeRef = React.createRef();
    let {name, value, onChange, ...propsRest} = props;
    this.propsRest = propsRest;
    this.dataObject = {name: name};
    value = parseInt(value);
    let d = new Date(isNaN(value) ? Date.now() : value);
    this.state = {date: dateFmt(d, 'RRRR-MM-DD'), time: dateFmt(d, 'GG:II')};
  }
  componentDidMount() {
    this.dateChange();
  }
  inputChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
    this.dateChange();
  }
  dateChange = () => {
    if (this.dateRef.current.checkValidity() && this.timeRef.current.checkValidity() ) {
      this.dataObject.value = Date.parse(this.dateRef.current.value + 'T' + this.timeRef.current.value);
      this.props.onChange(this.dataObject);
    }
  }
  render() {
    return (
      <nobr {...this.propsRest}>
        <input ref={this.dateRef} type="date" required={true} placeholder="rrrr-mm-dd"
          pattern="20[0-9]{2}-(0[0-9]|1[012])-([012][0-9]|3[01])" maxLength="10" size="10" 
          name="date" value={this.state.date} onChange={this.inputChange} 
          style={{maxWidth:'60%',marginRight:0}} />
        <input ref={this.timeRef} type="time" required={true} placeholder="gg:mm"
          pattern="([01][0-9]|2[0-3]):([0-5][0-9])" maxLength="5" size="5" 
          name="time" value={this.state.time} onChange={this.inputChange} 
          style={{maxWidth:'40%',marginLeft:0,marginRight:0}} />
      </nobr>
    );
  }
}

export default DateTimeField;
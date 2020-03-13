import React from 'react';
import {FaRegCalendarAlt, FaRegCalendarPlus, FaUserEdit} from 'react-icons/fa';
import {appNav, appScroll, cn} from './Utils';
import appData from './Utils/AppData';
import QuickSelect from './Utils/QuickSelect';
import {dateFmt} from './Utils/DateTimeField';
import css from './Details.module.scss';

export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.studentList = appData.getStudents();
    this.state = {student: appData.getStudent(props.match.params.id)};
    this.changedItemKey = appData.sess('changedItemKey');
    appData.sess('changedItemId', this.state.student.id);
    this.listWrapper = React.createRef();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.message !== this.props.message) {
      switch (this.props.message.action) {
        case 'update':
          this.changedItemKey = this.props.message.key;
          appScroll.unlockForElement();
          this.setState({student: appData.getStudent(this.state.student.id)});
          break;
        // no default
      }
    }
  }
  studentChangeHandler = (data) => {
    const id = parseInt(data.value);
    if (id > 0) this.props.history.push('/details/' + id);
  }
  order = (items) => appData.lessonsReverse ? items.reverse() : items;
  render() {
    const student = this.state.student;
    return (
      <div>
        <div className="pad frm">
          <div className="h2-btn">
            <h2><FaRegCalendarAlt/>Zajęcia</h2>
            <div>
              <button onClick={()=>this.props.history.push('/lesson/'+student.id)}>
                <FaRegCalendarPlus/>Dodaj
              </button>
            </div>
          </div>
          <p className="block-mdm">Imię i nazwisko:</p>
          <QuickSelect className="block-lrg" value={student.id} 
            onChange={this.studentChangeHandler}>
            {!student.id&&<option>WYBIERZ STUDENTA</option>}
            {this.studentList.map((stdnt, idx) => 
              <option key={idx} value={stdnt.id}>{stdnt.title}</option>
            )}
          </QuickSelect>
          <br/>
          {student.id>0&&<div>
            <p className="block-mdm">Przydział godzin:</p>
            <div className={cn('block-lrg', css.totalLength)}>
              <div className={css.completed}>
                <MinutesToHours value={student.completed} />
                <span className={css.min2hrsHours}> / {student.totalHours}</span>
                <br/><span className={css.title}>UKOŃCZONO</span>
              </div>
              <div className={css.remained}>
                <MinutesToHours value={(student.totalHours * 45) - student.completed} />
                <br/><span className={css.title}>POZOSTAŁO</span>
              </div>
            </div>
            <div className="btn-pnl">
              <button onClick={()=>this.props.history.push('/student/'+student.id)}>
                <FaUserEdit/>Edytuj
              </button>
            </div>
          </div>}
        </div>
        {student.lessons.length > 0 && <table ref={this.listWrapper} className={css.lessonList}>
          <thead>
            <tr>
              <th>Lp.</th><th>Data i godzina lekcji</th><th>Dł.</th>
            </tr>
          </thead>
          <tbody>
          {this.order(student.lessons.map((item, index) => 
            <tr key={index} className={cn(item.absent && css.absent,
                this.changedItemKey === item.key && 'changed-item'
              )}
              onClick={()=>appNav.push('/lesson/'+ student.id +'/'+ item.key)}>
              <td>{index+1}.</td>
              <td>{dateFmt(item.time, 'T, <mark>DD. N RRRR</mark>, GG:II', true)}</td>
              <td>{item.length}</td>
            </tr>
          ))}
          </tbody>
        </table>}
      </div>
    );
  }
}

export const MinutesToHours = (props) => {
  let minutes = props.value || 0;
  let fractional = minutes % 45;
  let decimal = minutes / 45;
  decimal = decimal < 0 ? Math.ceil(decimal) : Math.floor(decimal);
  if (fractional === 0) fractional = ''; else {
    let sign = fractional < 0 ? '' : '+';
    if (fractional % 1 !== 0) fractional = fractional.toFixed(1);
    fractional = (<span className={css.min2hrsMinutes}>{sign}{fractional}m</span>);
  }
  return (
    <span style={props.style} 
      className={cn(css.min2hrsHours, minutes < 0 && css.negative, props.className)}>
      {decimal}{fractional}
    </span>
  );
}

export const { remained: m2hCssRemained } = css;
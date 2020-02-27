import React from 'react';
import {FaRegCalendarAlt, FaRegCalendarPlus, FaUserEdit} from 'react-icons/fa';
import {appNav, appScroll, MinutesToHours} from './Utils';
import appData from './Utils/AppData';
import QuickSelect from './Utils/QuickSelect';
import {dateFmt} from './Utils/DateTimeField';

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
            <div className="block-lrg total-length">
              <div className="completed">
                <MinutesToHours value={student.completed} />
                <span className="min2hrs-hours"> / {student.totalHours}</span>
                <br/><span className="title">UKOŃCZONO</span>
              </div>
              <div className="remained">
                <MinutesToHours value={(student.totalHours * 45) - student.completed} />
                <br/><span className="title">POZOSTAŁO</span>
              </div>
            </div>
            <div className="btn-pnl">
              <button onClick={()=>this.props.history.push('/student/'+student.id)}>
                <FaUserEdit/>Edytuj
              </button>
            </div>
          </div>}
        </div>
        {student.lessons.length > 0 && <table ref={this.listWrapper} className="lesson-list">
          <thead>
            <tr>
              <th>Lp.</th><th>Data i godzina lekcji</th><th>Dł.</th>
            </tr>
          </thead>
          <tbody>
          {this.order(student.lessons.map((item, index) => 
            <tr className={this.changedItemKey===item.key?'changed-item':''} key={index} 
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
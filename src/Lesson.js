import React from 'react';
import {FiSave, FiPlus} from 'react-icons/fi';
import {FaRegCalendarPlus, FaEdit, FaTrashAlt} from 'react-icons/fa';
import {appNav, appScroll} from './Utils';
import {toastNotification} from './Utils/Dialogs';
import appData from './Utils/AppData';
import DateTimeField, {dateFmt} from './Utils/DateTimeField';
import LessonLengthSelect from './Utils/LessonLengthSelect';

export default class Lesson extends React.Component {
  constructor(props) {
    super(props);
    this.student = appData.getStudent(props.match.params.id);
    this.lessonKey = parseInt(props.match.params.key) || 0;
    this.editMode = false;
    this.addBtn = true;
    this.submitType = 'add';
    this.state = {time: Date.now(), length: 45, absent: false};
    let lesson = this.student.lessons.find(o => o.key === this.lessonKey);
    if (this.student.id && lesson) {
      this.editMode = true;
      Object.assign(this.state, 
        {time: lesson.time, length: lesson.length, absent: lesson.absent === 1});
      appData.sess('changedItemKey', lesson.key);
      if (!appData.sess('changedItemId')) { // call is not from the Details
        this.addBtn =  false;
        appData.sess('changedItemId', this.student.id);
      }
    } else if (this.student.id) {
      this.state.length = this.student.lessonLength || 45;
    } 
  }
  dataChangeHandler = (data) => this.setState({[data.name]: data.value});
  formSubmitHandler = (e) => {
    e.preventDefault();
    let msg = 'Dodano', rec = {id: this.student.id, lessonLength: this.state.length, lessons: 
      [{time: this.state.time, length: this.state.length, absent: this.state.absent ? 1 : 0}]};
    if (this.editMode && this.submitType === 'edit') {
      rec.lessons[0].key = this.lessonKey;
      msg = 'Zapisano';
    } 
    const res = appData.setStudent(rec).lessons[0];
    toastNotification('Lp. ' + (res.index+1) + ' – ' + msg + ' lekcję');
    appData.sess('changedItemKey', res.key);
    appScroll.unlockForElement();
    appNav.goBack();
  }
  removeClickHandler = (e) => {
    e.preventDefault();
    if (this.student.id && this.lessonKey > 0) {
      const lsn = appData.removeStudent(this.student.id, this.lessonKey)[0];
      if (lsn) {
        const msg = (<div><p><b>Usunięto lekcję</b></p>
          <p>{dateFmt(lsn.time, 'D. N RRRR<br>T, godz. GG:II', true)}<br/>
          {lsn.length} min.</p>
        </div>);
        toastNotification(msg, 5000, ['Cofnij']).then((clicked) => {
          if (clicked) {
            const res = appData.setStudent({id: this.student.id, lessons: [lsn]}).lessons[0];
            toastNotification('Lp. ' + (res.index+1) + ' – Przywrócono lekcję');
            if (appNav.pathMatch('/details/'+this.student.id+'$')) {
              this.props.sendMessage('details', {action: 'update', key: res.key});
            } else if (appNav.pathMatch('/list$')) { // if user has returned to student list
              this.props.sendMessage('list', {action: 'update', id: this.student.id});
            }
          }
        });
      }
      appNav.goBack();
    }
  }
  render() {
    return (
      <form className="pad frm" onSubmit={this.formSubmitHandler}>
        <input type="hidden" name="" value="add" />
        {this.editMode?
          <div className="h2-btn">
            <h2><FaEdit/>Edycja lekcji</h2>
            <div>
              <button type="button" onClick={this.removeClickHandler}>
                <FaTrashAlt/>Usuń
              </button>
            </div>
          </div>:
          <h2><FaRegCalendarPlus/>Dodawanie lekcji</h2>
        } 
        <p className="block-mdm">Imię i nazwisko:</p>
        <input className="block-lrg" type="text" value={this.student.title} disabled />
        {this.student.id > 0 && <div>
          <p className="block-mdm">Data i godzina:</p>
          <DateTimeField className="block-lrg" name="time"
            value={this.state.time} onChange={this.dataChangeHandler} />
          <br/>
          <p className="block-mdm">Długość zajęć:</p>
          <div className="block-lrg">
            <LessonLengthSelect className="block-sml" name="length" required 
              value={this.state.length} onChange={this.dataChangeHandler}/>
            <label htmlFor="absent">
              <input type="checkbox" name="absent" id="absent" checked={this.state.absent}
                onChange={({target: t}) => this.setState({[t.name]: t.checked})} />
              absencja
            </label>
          </div>
          <br/>
          <div className="btn-pnl">
            {this.editMode && <button type="submit" 
              onClick={()=>this.submitType='edit'}><FiSave/>Zapisz</button>}
            {this.addBtn && <button type="submit" 
              onClick={()=>this.submitType='add'}><FiPlus/>Dodaj</button>}
          </div>
        </div>}
      </form>
    );
  }
}
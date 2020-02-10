import React from 'react';
import {FiSave, FiPlus} from 'react-icons/fi';
import {FaUserEdit, FaUserPlus, FaTrashAlt} from 'react-icons/fa';
import {appNav, appScroll, toastNotification} from './Utils';
import appData from './Utils/AppData';

export default class Student extends React.Component {
  constructor(props) {
    super(props);
    this.student = appData.getStudent(props.match.params.id);
    this.inputTitle = React.createRef();
    if (this.student.id) {
      this.editMode = true;
      this.state = {title: this.student.title, totalHours: this.student.totalHours}; 
    } else {
      this.editMode = false;
      this.state = {title: '', totalHours: appData.totalHours};
    }
  }
  componentDidMount() {
    if (!this.editMode) this.inputTitle.current.focus();
  }
  inputChangeHandler = (e) => this.setState({[e.target.name]: e.target.value});
  formSubmitHandler = (e) => {
    e.preventDefault();
    let msg = 'Dodano', rec = {title: this.state.title.trim(), 
      totalHours: parseInt(this.state.totalHours)};
    if (this.editMode) {
      msg = 'Zapisano';
      rec.id = this.student.id;
    }
    const res = appData.setStudent(rec);
    toastNotification(msg + ' studenta – ' + rec.title);
    sessionStorage.setItem('changedItemId', res.id);
    appScroll.unlockForElement();
    appNav.goBack();
  }
  removeClickHandler = (e) => {
    e.preventDefault();
    if (this.editMode) {
      const stdnt = appData.removeStudent(this.student.id);
      const msg = <div><p><b>Usunięto studenta</b></p><p>{stdnt.title}</p></div>;
      toastNotification(msg, 5000, ['Cofnij']).then((clicked) => {
        if (clicked) {
          const res = appData.setStudent(stdnt);
          toastNotification('Przywrócono studenta – ' + stdnt.title);
          if (appNav.pathMatch('/list$')) {
            this.props.sendMessage('list', {action: 'update', id: res.id});
          }
        }
      });
      appNav.goHome();
    }
  }
  render() {
    return (
      <form className="pad frm" onSubmit={this.formSubmitHandler}>
        {this.editMode ?
          <div className="h2-btn">
            <h2><FaUserEdit/>Edycja studenta</h2>
            <div>
              <button type="button" onClick={this.removeClickHandler}><FaTrashAlt/>Usuń</button>
            </div>
          </div> :
          <h2><FaUserPlus/>Dodawanie studenta</h2>
        }
        <p className="block-mdm">Imię i nazwisko:</p>
        <input className="block-lrg" type="text" name="title" autoComplete="on" required
          ref={this.inputTitle} value={this.state.title} onChange={this.inputChangeHandler} />
        <br/>
        <p className="block-mdm">Przydział godzin:</p>
        <div className="block-lrg">
          <input type="number" className="block-sml" min={0} max={99}
            autoComplete="on" name="totalHours" required 
            value={this.state.totalHours} onChange={this.inputChangeHandler} />
        </div>
        <br/>
        <div className="btn-pnl">
          <button type="submit">{this.editMode?
            <span><FiSave/>Zapisz</span> : <span><FiPlus/>Dodaj</span>
          }</button>
        </div>
      </form>
    );
  }
}
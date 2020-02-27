import React from 'react';
import {FiSave, FiPlus} from 'react-icons/fi';
import {MdPersonAdd, MdGroupAdd} from 'react-icons/md';
import {FaUserEdit, FaUserPlus, FaTrashAlt} from 'react-icons/fa';
import {appNav, appScroll} from './Utils';
import {toastNotification, confirmDialog} from './Utils/Dialogs';
import appData from './Utils/AppData';

export default class Student extends React.Component {
  constructor(props) {
    super(props);
    this.student = appData.getStudent(props.match.params.id);
    if (this.student.id) {
      this.editMode = true;
      this.state = {title: this.student.title, totalHours: this.student.totalHours}; 
      appData.sess('changedItemId', this.student.id);
    } else {
      this.editMode = false;
      this.state = {title: '', totalHours: appData.totalHours};
    }
    this.state.multiple = false;
    this.state.textAreaContent = '';
    this.mainInput = React.createRef();
  }
  componentDidMount() {
    this.componentDidUpdate({}, {multiple: !this.state.multiple});
  }
  componentDidUpdate(prevProps, prevState) {
    if (!this.editMode && prevState.multiple !== this.state.multiple) {
      this.mainInput.current.focus();
    }
  }
  inputChangeHandler = (e) => this.setState({[e.target.name]: e.target.value});
  formSubmitHandler = (e) => {
    e.preventDefault();
    let res = null;
    if (this.state.multiple) { // multiple add
      const content = this.state.textAreaContent.trim();
      let count = 0;
      content.split('\n').map((s) => s.trim().split(/[\s]+/)).forEach((args) => {
        if (args.length < 2) return;
        const totalHours = parseInt(args.splice(-1)[0]);
        if (!(totalHours >= 0)) return;
        const rec = {totalHours: totalHours, title: args.join(' ')};
        res = appData.setStudent(rec);
        count++;
      });
      if (count > 0) {
        toastNotification('Dodano studentów: '+ count);
      } else {
        confirmDialog(<div>Wypisz studentów i&nbsp;przydziały godzin w&nbsp;kolejnych wierszach, 
          np.:<br/><pre>Krzysztof Kowalczyk 24<br/>Jan Kowalski 12</pre>itd.</div>, ['OK']);
      }
    } else { // single add or edit
      let msg = 'Dodano', rec = {title: this.state.title.trim(), 
        totalHours: parseInt(this.state.totalHours)};
      if (this.editMode) {
        msg = 'Zapisano';
        rec.id = this.student.id;
      }
      res = appData.setStudent(rec);
      toastNotification(msg + ' studenta – ' + rec.title);
    }
    if (res) {
      appData.sess('changedItemId', res.id);
      appScroll.unlockForElement();
      appNav.goBack();
    }
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
        {this.state.multiple ?
          <div>
            <p style={{marginBottom:'0.3em'}}>Student i przydział godzin w jednym wierszu:</p>
            <textarea style={{resize:'none',width:'100%',height:'7.3rem'}}
              name="textAreaContent" spellCheck="false" value={this.state.textAreaContent}
              ref={this.mainInput} onChange={this.inputChangeHandler}></textarea>
          </div>
          : 
          <div>
            <p className="block-mdm">Imię i nazwisko:</p>
            <input className="block-lrg" type="text" name="title" autoComplete="on" required
              ref={this.mainInput} value={this.state.title} onChange={this.inputChangeHandler} />
            <br/>
            <p className="block-mdm">Przydział godzin:</p>
            <div className="block-lrg">
              <input type="number" className="block-sml" min={0} max={99}
                autoComplete="on" name="totalHours" required 
                value={this.state.totalHours} onChange={this.inputChangeHandler} />
            </div>
          </div>
        }
        <div className="btn-pnl">
          <button type="submit">{this.editMode ?
            <span><FiSave/>Zapisz</span> : <span><FiPlus/>Dodaj</span>
          }</button>
          {!this.editMode && <button type="button"
            onClick={() => this.setState({multiple: !this.state.multiple})}>
            {this.state.multiple ?
              <span><MdPersonAdd/>Pojedynczo</span> : <span><MdGroupAdd/>Masowo</span>
            }
          </button>}
        </div>
      </form>
    );
  }
}
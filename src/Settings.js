import React from 'react';
import {MdSettings} from 'react-icons/md';
import {FaFileExport, FaFileImport, FaTrashAlt, FaRegCalendarMinus} from 'react-icons/fa';
import {setSystemFont} from './Utils';
import {confirmDialog} from './Utils/Dialogs';
import appData from './Utils/AppData';
import QuickSelect from './Utils/QuickSelect';

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.textArea = React.createRef();
    this.state = this.getSettingsState();
    this.state.textAreaContent = '';
  }
  getSettingsState() {
    const sp = appData.sortParams.split(',');
    return {
      studentsReverse: sp[0], 
      studentsSortBy: sp[1] + (sp[2] ? ',' + sp[2] : ''), 
      lessonsReverse: appData.lessonsReverse, 
      systemFont: appData.systemFont,
      noStretching: appData.noStretching,
      smoothScroll: appData.smoothScroll,
      fixedNavBar: appData.fixedNavigationBar, 
      dataSize: appData.getSize(),
    };
  }
  updateVisualSettings = () => {
    setSystemFont(this.state.systemFont);
    this.props.sendMessage('noStretching', this.state.noStretching);
    this.props.sendMessage('scrollMode', this.state.smoothScroll ? 'smooth' : 'auto');
    this.props.sendMessage('fixedNavBar', this.state.fixedNavBar);
  }
  inputChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.type === "checkbox" ? (e.target.checked ? 1 : 0) : e.target.value;
    this.setState({[name]: value}, () => {
      switch (name) {
        case 'studentsReverse': case'studentsSortBy':
          appData.sortParams = this.state.studentsReverse + ',' + this.state.studentsSortBy;
          break;
        case 'lessonsReverse':
          appData.lessonsReverse = this.state.lessonsReverse;
          break;
        case 'systemFont':
          appData.systemFont = value;
          setSystemFont(value);
          break;
        case 'noStretching':
          appData.noStretching = value;
          this.props.sendMessage('noStretching', value);
          break;
        case 'smoothScroll':
          appData.smoothScroll = value;
          this.props.sendMessage('scrollMode', value ? 'smooth' : 'auto');
          break;
        case 'fixedNavBar':
          appData.fixedNavigationBar = value;
          this.props.sendMessage('fixedNavBar', value);
          break;
        // no default
      }
    });
  }
  importClickHandler = () => {
    if (appData.importFromJSON(this.state.textAreaContent)) {
      this.setState({...this.getSettingsState(), textAreaContent: ''}, this.updateVisualSettings);
      confirmDialog('Poprawnie zaimportowano dane.', ['OK']);
    } else {
      confirmDialog('Błąd importowania! Niepoprawny format danych.', ['OK']);
    }
  }
  exportClickHandler = () => {
    this.setState({textAreaContent: appData.exportToJSON()}, () => {
      this.textArea.current.focus();
      this.textArea.current.select();
    });
  }
  clearLessonsClickHandler = () => {
    confirmDialog('Uwaga! Tej operacji nie można cofnąć! ' +
      'Czy potwierdzasz usunięcie zajęć wszystkich studentów?'
    ).then((confirmed) => {
      if (confirmed) {
        appData.clearLessons();
        this.setState({dataSize: appData.getSize()});
      }
    });
  }
  clearDataClickHandler = () => {
    confirmDialog('Uwaga! Tej operacji nie można cofnąć! ' +
      'Czy potwierdzasz usunięcie wszystkich danych aplikacji?'
    ).then((confirmed) => {
      if (confirmed) {
        appData.clearData();
        this.setState(this.getSettingsState(), this.updateVisualSettings);
      }
    });
  }
  render() {
    return (
      <div className="pad frm">
        <h2><MdSettings/>Ustawienia</h2>
        <h3>Dane aplikacji zajmują <b>{this.state.dataSize}</b> KB</h3>
        <div style={{margin:'1.1em 0 0.7em 0',whiteSpace:'pre'}}>
          <button type="button" onClick={this.clearLessonsClickHandler}>
            <FaRegCalendarMinus/>Usuń zajęcia
          </button>
          <button type="button" onClick={this.clearDataClickHandler} style={{marginRight:0}}>
            <FaTrashAlt/>Usuń wszystko
          </button>
        </div>
        <h3>Sortowanie według parametru</h3>
        <p className="block-mdm">Lista studentów:</p>
        <div className="block-lrg" style={{display:'inline-flex'}}>
          <div>
            <QuickSelect name="studentsSortBy"
              onChange={(d)=>this.inputChangeHandler({target:{name:d.name,value:d.value}})}
              value={this.state.studentsSortBy}>
              <option value="order">Własne uszeregowanie</option>
              <option value="id">Kolejność dodawania</option>
              <option value="completed,1">Ukończenie przydziału</option>
              <option value="title">Pierwszy wyraz (Imię)</option>
              <option value="title,1">Ostatni wyraz (Nazwisko)</option>
              <option value="totalHours">Przydział godzin</option>
            </QuickSelect>
            <p>
              <input type="checkbox" name="studentsReverse" id="studentsReverse" 
                checked={parseInt(this.state.studentsReverse)} onChange={this.inputChangeHandler} />
              <label htmlFor="studentsReverse">Odwrócony porządek</label>
            </p>
          </div>
        </div>
        <p className="block-mdm">Lista zajęć:</p>
        <div className="block-lrg" style={{display:'inline-flex'}}>
          <div>
            <input type="text" value="Data i godzina" disabled />
            <p>
              <input type="checkbox" name="lessonsReverse" id="lessonsReverse" 
                checked={this.state.lessonsReverse} onChange={this.inputChangeHandler} />
              <label htmlFor="lessonsReverse">Odwrócony porządek</label>
            </p>
          </div>
        </div>
        <h3>Wygląd</h3>
        <p className="block-lrg">
          <input type="checkbox" name="systemFont" id="systemFont" 
            checked={this.state.systemFont} onChange={this.inputChangeHandler} />
          <label htmlFor="systemFont">Czcionka systemowa</label>
        </p>
        <p className="block-lrg">
          <input type="checkbox" name="noStretching" id="noStretching" 
            checked={this.state.noStretching} onChange={this.inputChangeHandler} />
          <label htmlFor="noStretching">Brak animacji rozciągania</label>
        </p>
        <p className="block-lrg">
          <input type="checkbox" name="smoothScroll" id="smoothScroll" 
            checked={this.state.smoothScroll} onChange={this.inputChangeHandler} />
          <label htmlFor="smoothScroll">Płynne przewijanie (Android)</label>
        </p>
        <p className="block-lrg">
          <input type="checkbox" name="fixedNavBar" id="fixedNavBar" 
            checked={this.state.fixedNavBar} onChange={this.inputChangeHandler} />
          <label htmlFor="fixedNavBar">Przyklejony pasek nawigacji</label>
        </p>
        <h3>Eksport i import danych</h3>
        <textarea style={{resize:'none',width:'100%',height:'14rem'}} 
          ref={this.textArea} name="textAreaContent" spellCheck="false"
          onChange={this.inputChangeHandler} value={this.state.textAreaContent}></textarea>
        <br/>
        <button type="button" 
          onClick={this.exportClickHandler}><FaFileExport/>Eksportuj</button>
        <button type="button" 
          onClick={this.importClickHandler}><FaFileImport/>Importuj</button>
        <p>
          Dane wyeksportowane do powyższego pola tekstowego można skopiować i&nbsp;przesłać 
          drogą internetową np. e-mailem. Aby odczytać dane w&nbsp;innej aplikacji należy wkleić 
          je do pola tekstowego i użyć przycisku <em>Importuj</em>.
        </p>
      </div>
    );
  }
}
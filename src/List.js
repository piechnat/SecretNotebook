import React from 'react';
import {Link} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import {MdSwapVert} from 'react-icons/md';
import {FaUserEdit, FaUserPlus, FaUsers, FaRegCalendarPlus} from 'react-icons/fa';
import {appNav, appScroll, cn} from './Utils';
import {MinutesToHours, m2hCssRemained} from './Details';
import {toastNotification} from './Utils/Dialogs';
import appData from './Utils/AppData';
import LessonLengthSelect from './Utils/LessonLengthSelect'
import Swipe from  './Utils/Swipe';
import {dateFmt} from './Utils/DateTimeField';
import css from './List.module.scss';

export default class List extends React.Component {
  constructor(props) {
    super(props);
    this.root = document.getElementById('root-component');
    this.state = {studentList: appData.getStudents(), 
      lessonLength: [], expanded: 0, swapIdx: -1, changedItemId: appData.sess('changedItemId')};
    appData.sess('changedItemKey'); // remove only
    for (let student of this.state.studentList) {
      this.state.lessonLength[student.id] = student.lessonLength || 45;
    }
    this.listWrapper = React.createRef();
    const sortBy = appData.sortParams.split(',')[1];
    this.updateAll = sortBy === 'completed';
    this.ownOrder = sortBy === 'order';
  }
  componentDidMount() {
    document.addEventListener('mousedown', this.clickOutsideHandler);
  }
  componentWillUnmount() {
    document.removeEventListener('mousedown', this.clickOutsideHandler);
  }
  clickOutsideHandler = (e) => {
    const elm = this.listWrapper.current;
    if (elm && this.root.contains(e.target) && !elm.contains(e.target)) {
      this.setState({expanded: 0, swapIdx: -1});
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.message !== this.props.message) {
      switch (this.props.message.action) {
        case 'update':
          this.updateStudentList(this.props.message.id, true);
          break;
        // no default
      }
    }
  }
  updateStudentList = (id, all) => {
    appScroll.unlockForElement();
    if (all || this.updateAll) {
      const sList = appData.getStudents(), lLength = [];
      sList.forEach(o => lLength[o.id] = o.lessonLength || 45);
      this.setState({studentList: sList, lessonLength: lLength, changedItemId: id});
    } else {
      this.setState(state => {
        state.studentList.forEach((o, i, a) => { if (o.id === id) a[i] = appData.getStudent(id); });
        return {studentList: state.studentList, changedItemId: id};
      });
    }
  }
  expandMenu = (id, value) => {
    value = (value !== undefined) ? value : (this.state.expanded !== id);
    this.setState({expanded: value ? id : 0});
  }
  lessonLengthChangeHandler = (d) => this.setState(state => {
    state.lessonLength.forEach((o, i, a) => { if (i === d.name) a[i] = d.value; });
    return {lessonLength: state.lessonLength};
  });
  listItemClickHandler = (id, idx, e) => {
    if (this.state.swapIdx > -1) { // move item
      const state = {swapIdx: -1};
      if (idx !== this.state.swapIdx) {
        const swapStdnt = this.state.studentList[this.state.swapIdx];
        let tmp = this.state.studentList[idx].order, order;
        if (idx === 0 || idx === this.state.studentList.length - 1) {
          order = tmp + (swapStdnt.order > tmp ? -1000000 : 1000000);
        } else  {
          idx += (this.state.swapIdx > idx) ? -1 : 1;
          order = (tmp + this.state.studentList[idx].order) >> 1;
        }
        appData.setStudent({id: swapStdnt.id, order: order});
        if (Math.abs(tmp - order) < 10) appData.updateOrder();
        state.studentList = appData.getStudents();
        state.changedItemId = swapStdnt.id;
      }
      this.setState(state);
      e.preventDefault();
    } else if (e.target.getAttribute('name') === 'indicator') { // open menu
      setTimeout(() => this.expandMenu(id), 10);
    } else if (e.target.getAttribute('name') === 'title') { // open details
      appNav.push('/details/' + id);
      e.preventDefault();
    }
  }
  addClickHandler = (id, e) => {
    e.preventDefault();
    const time = Date.now();
    const rec = {id: id, lessonLength: this.state.lessonLength[id], lessons: [
      {time: time, length: this.state.lessonLength[id]}
    ]};
    const stdnt = appData.getStudent(id);
    const msg = (<div><p><b>Dodano lekcję</b></p>
      <p>{stdnt.title}<br/>
      {dateFmt(time, 'D. N RRRR<br>T, godz. GG:II', true)}<br/>
      {this.state.lessonLength[id]} min.
      </p>
    </div>);
    const res = appData.setStudent(rec).lessons[0];
    toastNotification(msg, 5000, ['Otwórz']).then((clicked) => {
      if (clicked) appNav.push('/lesson/'+ id +'/'+ res.key);
    });
    this.setState({expanded: 0});
    this.updateStudentList(id);
  }
  render() {
    return (
      <div style={{paddingTop:'1rem',paddingBottom:'1rem'}}>
        <div className="h2-btn" style={{margin:'0 1rem'}}>
          <h2 style={{margin:0}}><FaUsers/>Studenci</h2>
          <div>
            <button onClick={()=>this.props.history.push('/student/0')}>
              <FaUserPlus/>Dodaj
            </button>
          </div>
        </div>
        {this.state.studentList.length > 0 &&
          <div className={css.studentList} ref={this.listWrapper}>
          {this.state.studentList.map((stdnt, index) =>
            <Swipe key={stdnt.id + index + stdnt.completed} 
              onClick={(e)=>this.listItemClickHandler(stdnt.id,index,e)}
              onLeft={(e)=>this.expandMenu(stdnt.id,1)} 
              onRight={(e)=>this.expandMenu(stdnt.id,0)}
              className={cn(css.item,
                this.state.changedItemId === stdnt.id && 'changed-item',
                this.state.swapIdx > -1 && this.state.swapIdx !== index && 'selected-item'
              )}>
              <div className={css.indicator} key="indicator" name="indicator">
                <FiArrowLeft/>
              </div>
              <div key="menu" className={cn(css.menu, 
                  this.state.expanded === stdnt.id ? css.open : css.close
                )}>
                {this.ownOrder && <Link to="#" onClick={(e) => {
                    e.preventDefault();
                    this.setState({expanded: 0, swapIdx: index});
                  }}><MdSwapVert/>
                </Link>}
                <Link to={'/student/'+stdnt.id}><FaUserEdit/></Link>
                <LessonLengthSelect 
                  className={css.smallSelect} 
                  name={stdnt.id} 
                  value={this.state.lessonLength[stdnt.id]}
                  onChange={this.lessonLengthChangeHandler}
                />
                <Link to="#" onClick={(e)=>this.addClickHandler(stdnt.id,e)}>
                  <FaRegCalendarPlus/>
                </Link>
              </div>
              <div className={css.title} key="title" name="title">
                {stdnt.title} &nbsp;<MinutesToHours className={m2hCssRemained} 
                  value={(stdnt.totalHours * 45) - stdnt.completed} />      
              </div>
            </Swipe>
          )}
          </div>
        }
      </div>
    );
  }
}
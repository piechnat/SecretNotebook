import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom';
import {IoIosArrowDropleft, IoIosHelpCircleOutline, IoIosSettings} from 'react-icons/io';
import * as serviceWorker from './serviceWorker';
import {config, appNav, appScroll, setSystemFont, cn} from './Utils';
import workingDays from './Utils/WorkingDays';
import {confirmDialog} from './Utils/Dialogs';
import appData from './Utils/AppData';
import FlexibleHeight from './Utils/FlexibleHeight';
import FadeTransition from './Utils/FadeTransition';
import {dateFmt} from './Utils/DateTimeField';
import List from './List';
import Student from './Student';
import Details from './Details';
import Lesson from './Lesson';
import Settings from './Settings';
import Help, {Demo} from './Help';
import './Assets/fonts.css';
import './index.global.scss';
import css from './index.module.scss';

if (appData.systemFont) setSystemFont(1);
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
window.addEventListener('load', () => document.documentElement.classList.add('document-ready'));

class RootComponent extends React.Component {
  constructor(props) {
    super(props);
    appNav.init(props.history);
    this.state = {
      scrollMode: appData.smoothScroll ? 'smooth' : 'auto',
      noStretching: appData.noStretching,
      fixedNavBar: appData.fixedNavigationBar
    };
  }
  componentDidMount() {
    if (appNav.pwaMode) {
      window.gtag('event', 'pwa_start', {time: dateFmt(new Date(), 'MM-DD GG:II')});
    }
    if (!appData.versionEquals(config.version)) {
      window.gtag('event', 'pwa_update', {version: config.version});
      this.props.history.push('/help'); 
    }
    appScroll.onBeforeScrolling = () => {
      document.documentElement.style.scrollBehavior = !appScroll.isUnlockedForElement() && 
        (appNav.scrollMemory === 0 || this.state.noStretching) ? 'auto' : this.state.scrollMode;
    };
    appNav.onScrollMemoryChange = () => appScroll.unlockBegin();
  }
  contentChangeHandler = (heightResizeStart) => {
    if (appScroll.beginIsUnlocked()) {
      if (appNav.scrollMemory === 0 && !appScroll.isUnlockedForElement()) {
        appScroll.toPos(0); 
      } else if (!heightResizeStart) {
        this.resizeEndHandler();
      }
    }
  }
  resizeEndHandler = () => {
    if (appScroll.endIsUnlocked()) {
      if (appScroll.isUnlockedForElement()) {
        appScroll.toElement('changed-item');
      } else if (appNav.scrollMemory >= 0) {
        appScroll.toPos(appNav.scrollMemory);
      }
    }
  }
  sendMessage = (name, state) => this.setState({[name]: state});
  render() {
    const location = this.props.location, pth = location.pathname.substr(1);
    const msgProps = (o, n) => ({...o, sendMessage: this.sendMessage, message: this.state[n]});
    return (
      <div id={css.mainWrapper}>
        <div id={css.fixedBackground}/>
        <div id={css.headerContentCover}/>
        <div id={css.headerWrapper}>
          <h1 id={css.header} onClick={()=>appNav.goHome()}>
            <span>Secret Notebook</span>
            {workingDays && <span id={css.workingDays}>
              {['ND', 'PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB'][new Date().getDay()]}<br/>
              {workingDays}
            </span>}
          </h1>
        </div>
        <div id={css.content}>
          <FlexibleHeight duration={this.state.noStretching?0:200} 
            onContentChange={this.contentChangeHandler} onResizeEnd={this.resizeEndHandler}>
            <FadeTransition id={location.pathname} duration={300} className={css.fadeTransition}>
              <Switch location={location}>
                <Route path="/list" render={(p)=><List {...msgProps(p,'list')}/>}/>
                <Route path="/student/:id?" render={(p)=><Student {...msgProps(p)}/>}/>
                <Route path="/details/:id?" render={(p)=><Details {...msgProps(p,'details')}/>}/>
                <Route path="/lesson/:id?/:key?" render={(p)=><Lesson {...msgProps(p)}/>}/>
                <Route path="/settings" render={(p)=><Settings {...msgProps(p)} />}/>
                <Route path="/help" component={Help}/>
                <Route path="/demo" component={Demo}/>
                <Redirect exact from="/" to="/list"/>
                <Route render={NotFound}/>
              </Switch>
            </FadeTransition>
          </FlexibleHeight>
        </div>
        <div id={cn(this.state.fixedNavBar && css.fixedNavBar)}>
          <div id={css.footerContentCover}/>
          <div id={css.footerWrapper}>
            <div id={css.footer}>
              <button className={cn(pth === 'list' && css.disabled)} 
                  onClick={()=>appNav.goBack()}>
                <IoIosArrowDropleft/><span>Wstecz</span>
              </button>
              <div className={css.freeSpace}/>
              <button className={cn(pth === 'settings' && css.disabled)} 
                  onClick={()=>appNav.push('/settings')}>
                <IoIosSettings/><span>Ustawienia</span>
              </button>
              <button className={cn(pth === 'help' && css.disabled)} 
                  onClick={()=>appNav.push('/help')}>
                <IoIosHelpCircleOutline/><span>Pomoc</span>
              </button>
            </div>
          </div>
          <div id={css.footerMargin}></div>
        </div>
      </div>
    );
  }
};

const NotFound = (props) => (
  <p className="pad">Niepoprawny adres "{props.location.pathname.substr(1)}".</p>
);

ReactDOM.render(
  <BrowserRouter basename={config.basePath}>
    <Route component={RootComponent}/>
  </BrowserRouter>, 
  document.getElementById('root-component')
);

serviceWorker.register({onUpdate: (registration) => {
  confirmDialog(
    'Uruchom aplikację ponownie, aby zaktualizować do nowszej wersji.'
  ).then((confirmed) => {
    if (confirmed) {
      document.documentElement.classList.remove('document-ready');
      registration.unregister().finally(() => appNav.reload());
    }
  });
}});
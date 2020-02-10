import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';

export const config = (process.env.NODE_ENV === 'production') ? {
  debug: false, // production
  baseUrl: 'http://secretnotebook.piechnat.pl/'
} : {
  debug: true, // development
  baseUrl: 'http://192.168.1.111:3000/'
};
Object.assign(config, {
  basePath: config.baseUrl.replace(/([^/]+:\/\/[^/]+)/, ''),
  title: document.title,
  version: 1.1
});

export function setSystemFont(value) {
  const s = document.documentElement.style;
  const d = value ? ['sans-serif', 300, 400, 500] : ["'Raleway', sans-serif", 400, 500, 600];
  s.setProperty('--main-font-family', d[0]);
  s.setProperty('--main-light-weight', d[1]);
  s.setProperty('--main-medium-weight', d[2]);
  s.setProperty('--main-bold-weight', d[3]);
}

class AppNav {
  _history = null;
  deltaHome = null;
  delay = 10;
  scrollMemory = 0;
  onScrollMemoryChange = null;
  androidOS = /android/i.test(navigator.userAgent);
  pwaStart = window.location.search === '?PWASTART';
  reset() {}
  init(history) {
    if (!history || this._history) return false;
    this._history = history;
    if (!history.location.key) history.replace(
      history.location.pathname + history.location.search + history.location.hash
    );
    let currKey, homeKey, hstrList, hstrPos, scrollList;
    this.reset = () => {homeKey = ''; hstrList = [currKey]; hstrPos = 0; scrollList = {}};
    let onLocationChange = (location, action) => {
      currKey = location.key || location.pathname;
      if (action === 'LOAD') try {
        homeKey = sessionStorage.getItem('homeKey');
        hstrList = JSON.parse(sessionStorage.getItem('hstrList'));
        scrollList = JSON.parse(sessionStorage.getItem('scrollList'));
        hstrPos = hstrList.indexOf(currKey);
        if (hstrList.indexOf(homeKey) < 0 || hstrPos < 0) throw Error();
      } catch { this.reset(); }
      scrollList[hstrList[hstrPos]] = window.pageYOffset;
      if (action === 'PUSH') {
        if (++hstrPos < hstrList.length) {
          let deleted = hstrList.splice(hstrPos);
          for (let item of deleted) delete scrollList[item];
        }
        hstrList.push(currKey);
      }
      if (action === 'REPLACE') {
        if (hstrList[hstrPos] === homeKey) homeKey = currKey;
        delete scrollList[hstrList[hstrPos]];
        hstrList[hstrPos] = currKey;
      }
      if (action === 'POP') {
        hstrPos = hstrList.indexOf(currKey);
        if (hstrPos < 0) this.reset();
      }
      if (homeKey === '' && location.pathname === '/list') homeKey = currKey;
      this.deltaHome = (homeKey === '') ? null : hstrList.indexOf(homeKey) - hstrPos;
      /* DEBUG 
      alert(
        'action: ' + action + ' pathname: ' + location.pathname + location.search + location.hash +
        '\nhomeKey: ' + homeKey + ' hstrPos: ' + hstrPos + 
        '\nhstrList: [' + hstrList.join(', ') + ']\nscrollList: ' + JSON.stringify(scrollList)
        );
      */
      this.scrollMemory = scrollList[hstrList[hstrPos]] || 0;
      if (typeof this.onScrollMemoryChange === 'function') this.onScrollMemoryChange();
      // Double back press to exit on Android
      if (this.androidOS && location.search === '?PWASTART') {
        homeKey = '';
        if (action === 'POP') {
          toastNotification(<span>Naciśnij ponownie <em>Wstecz</em>, aby zamknąć.</span>, 800);
          setTimeout(() => this._history.push(location.pathname), 1200);
        } else {
          this._history.push(location.pathname);
        }
      }
    };
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('homeKey', homeKey);
      sessionStorage.setItem('hstrList', JSON.stringify(hstrList));
      sessionStorage.setItem('scrollList', JSON.stringify(scrollList));
    });
    history.listen(onLocationChange);
    onLocationChange(history.location, 'LOAD');
    return true;
  }
  goHome = () => {
    if (!this._history) return;
    if (this.deltaHome) {
      setTimeout(() => this._history.go(this.deltaHome), this.delay); 
    } else {
      if (this.deltaHome === null) this.push('/list'); 
    }
    sessionStorage.removeItem('changedItemKey');
  }
  goBack = () => {
    if (!this._history) return;
    if (this.deltaHome < 0) {
      setTimeout(() => this._history.goBack(), this.delay); 
    } else {
      this.goHome();
    }
  }
  push = (...args) => {
    if (this._history) setTimeout(() => this._history.push(...args), this.delay);
  }
  replace = (...args) => {
    if (this._history) setTimeout(() => this._history.replace(...args), this.delay);
  }
  pathMatch = (str) => {
    return this._history.location.pathname.match(new RegExp(str, 'i'));
  }
}
export const appNav = new AppNav();

export const MinutesToHours = (props) => {
  let minutes = props.value || 0;
  let fractional = minutes % 45;
  let decimal = minutes / 45;
  decimal = decimal < 0 ? Math.ceil(decimal) : Math.floor(decimal);
  if (fractional === 0) fractional = ''; else {
    let sign = fractional < 0 ? '' : '+';
    if (fractional % 1 !== 0) fractional = fractional.toFixed(1);
    fractional = (<span className="min2hrs-minutes">{sign}{fractional}m</span>);
  }
  return (
    <span style={props.style} className={'min2hrs-hours'+
      (minutes<0?' negative':'')+' '+(props.className||'')}>
      {decimal}{fractional}
    </span>
  );
}

export function toastNotification(message, duration, button) {
  if (!(duration > 0)) duration = 3000;
  return new Promise((resolve) => {
    const id = 'toast-notification-container', animTime = 300;
    let ntfCntr = document.getElementById(id);
    if (!ntfCntr) {
      ntfCntr = document.createElement('div');
      ntfCntr.setAttribute('id', id);
      document.body.appendChild(ntfCntr);
    }
    const container = document.createElement('div');
    container.setAttribute('style', 'position:fixed;visibility:hidden');
    container.setAttribute('count', true);
    ntfCntr.appendChild(container);
    let locked = false;
    const close = (res) => {
      if (locked) return;
      locked = true;
      container.removeAttribute('count');
      container.style.bottom = (-container.offsetHeight) + 'px';
      let node = ntfCntr.firstChild, pos = 0;
      do { 
        if (node.getAttribute('count')) {
          node.style.bottom = pos + 'px';
          pos += node.offsetHeight;
        }
      } while ((node = node.nextSibling));
      setTimeout(() => {
        ReactDOM.unmountComponentAtNode(container);
        ntfCntr.removeChild(container);
        if (!ntfCntr.hasChildNodes()) document.body.removeChild(ntfCntr);
      }, animTime);
      resolve(res === true);
    }
    const dismiss = (e) => {
      if (!e.target.classList.contains('btn')) { e.preventDefault(); close(false); }
    }
    const ToastNotification = () => {
      useEffect(() => {
        container.setAttribute('style', 'position:fixed;transition:bottom '+ animTime +'ms;'+
          'left:0;right:0;bottom:-'+container.offsetHeight+'px;z-index:2147483647');
        let pos = 0, node = container;
        while ((node = node.previousSibling)) 
          if (node.getAttribute('count')) pos += node.offsetHeight;
        setTimeout(() => container.style.bottom = pos + 'px', 50);
        setTimeout(close, duration);
      }, []);
      return (
        <div className="toast-notification" onTouchEnd={dismiss} onMouseUp={dismiss}>
          <div className="toast-notification-msg">{message}</div>
          <div className="toast-notification-btn">
            {button&&<button className="btn" 
              onClick={()=>setTimeout(()=>close(true),10)}>{button}</button>}
          </div>
        </div>
      );
    };
    ReactDOM.render(<ToastNotification/>, container);
  });
}

export function confirmDialog(message, buttons) {
  if (buttons === undefined) buttons = ['OK', 'Anuluj'];
  return new Promise((resolve) => {
    const container = document.createElement('div'), animTime = 200;
    document.body.appendChild(container);
    const close = () => setTimeout(() => {
      ReactDOM.unmountComponentAtNode(container);
      if (container.parentNode === document.body) document.body.removeChild(container);
      window.removeEventListener('popstate', onPopstate);
    }, animTime);
    const onPopstate = () => { resolve(false); close(); };
    window.addEventListener('popstate', onPopstate);
    const ConfirmDialog = () => {
      const [opacity, setOpacity] = useState(0);
      useEffect(() => {
        setTimeout(() => setOpacity(1), 50);
      }, []);
      return (
        <div style={{opacity: opacity,
            transition: 'opacity '+ animTime +'ms ease-in',
            position: 'fixed', zIndex: 2147483647, 
            left: 0, top: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)'
          }}>
            <div className="confirm-dialog" style={{
              position: 'absolute', top: '50%', left: '50%', 
              transform: 'translateX(-50%) translateY(-50%)', 
            }}>
              <div className="confirm-dialog-msg">{message}</div>
              <div className="confirm-dialog-btn">
                {buttons[1]&&<button className="btn-cancel" 
                  onClick={()=>{setOpacity(0);resolve(false);close();}}>{buttons[1]}</button>}
                {buttons[0]&&<button className="btn-ok" 
                  onClick={()=>{setOpacity(0);resolve(true);close();}}>{buttons[0]}</button>}
              </div>
            </div>
        </div>
      );
    };
    ReactDOM.render(<ConfirmDialog/>, container);
  });
}

export function selectDialog(optionsList, defIndex) {
  defIndex = defIndex > -1 ? defIndex : -1;
  return new Promise((resolve) => {
    const container = document.createElement('div'), animTime = 200;
    document.body.appendChild(container);
    const close = (delay) => setTimeout(() => {
      ReactDOM.unmountComponentAtNode(container);
      if (container.parentNode === document.body) document.body.removeChild(container);
      window.removeEventListener('popstate', cancel);
    }, delay > 0 ? delay : 0);
    const cancel = () => { resolve(defIndex); close(); };
    window.addEventListener('popstate', cancel);
    const SelectDialog = () => {
      let selDlg;
      const [opacity, setOpacity] = useState(0);
      useEffect(() => {
        setTimeout(() => setOpacity(1), 50);
        if (selDlg) {
          const selected = selDlg.getElementsByClassName('selected')[0];
          if (selected) selected.scrollIntoView({block: "center"});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return (
        <div onClick={(e)=>{if(selDlg&&!selDlg.contains(e.target))cancel()}} 
          style={{opacity: opacity,
            transition: 'opacity '+ animTime +'ms ease-in',
            position: 'fixed', zIndex: 2147483647, 
            left: 0, top: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)'
          }}>
            <div ref={(e)=>selDlg=e} className="select-dialog" 
              style={{
                position: 'absolute', top: '50%', left: '50%', 
                transform: 'translate(-50%, -50%)'
              }}>
              <ul>
                {optionsList.map((item, index) => 
                  <li key={index} 
                    className={(index===defIndex)?'selected':undefined} 
                    onClick={()=>setTimeout(()=>{
                      setOpacity(0);resolve(index);close(animTime);
                    },10)}>
                    {item}
                  </li>
                )}
              </ul>
            </div>
        </div>
      );
    };
    ReactDOM.render(<SelectDialog/>, container);
  });
}

class AppScroll {
  _scrollBeginFlag = false;
  _scrollEndFlag = false;
  _scrollToElementFlag = false;
  onBeforeScrolling = null;
  toPos(yPos) {
    window.scrollTo(0, yPos);
  }
  toElement(className) {
    this._scrollToElementFlag = false;
    const elm = document.getElementsByClassName(className).item(0);
    if (elm) {
      this.toPos(elm.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight / 2));
    }
  }
  unlockBegin() {
    if (!this._scrollBeginFlag && typeof this.onBeforeScrolling === 'function') {
      this.onBeforeScrolling();
    }
    this._scrollBeginFlag = true;
  }
  unlockForElement() {
    this._scrollToElementFlag = true;
    this.unlockBegin();
  }   
  isUnlockedForElement() {
    return this._scrollToElementFlag;
  }
  beginIsUnlocked() {
    if (!this._scrollBeginFlag) return false; 
    else {
      this._scrollBeginFlag = false;
      this._scrollEndFlag = true;
      return true;
    }
  }
  endIsUnlocked() {
    if (!this._scrollEndFlag) return false; 
    else {
      this._scrollEndFlag = false;
      return true;
    }
  }
}

export const appScroll = new AppScroll();
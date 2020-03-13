import React from 'react';
import {toastNotification} from './Dialogs';

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
  version: 1.2
});

export const cn = (...args) => args.filter(arg => arg && arg.length > 0).join(' ');

export function setSystemFont(value) {
  const s = document.documentElement.style;
  const d = value ? ['sans-serif', 300, 400, 500] : ["'Raleway', sans-serif", 400, 500, 600];
  s.setProperty('--main-font-family', d[0]);
  s.setProperty('--main-light-weight', d[1]);
  s.setProperty('--main-medium-weight', d[2]);
  s.setProperty('--main-bold-weight', d[3]);
}

class AppNav {
  _unlisten = () => {};
  _history = null;
  _prevLctn = {};
  _deltaHome = null;
  _delay = 10;
  scrollMemory = -1;
  onScrollMemoryChange = null;
  androidOS = true; /* /android/i.test(navigator.userAgent); */
  pwaMode = window.location.search === '?PWASTART';
  init(hstr) {
    if (!hstr || this._history) return false;
    this._history = hstr;
    if (!hstr.location.key) {
      this._prevLctn = this._history.location;
      hstr.replace(hstr.location.pathname + hstr.location.search + hstr.location.hash);
    }
    let currKey, homeKey, hstrList, hstrPos, scrollList;
    const reset = () => {homeKey = ''; hstrList = [currKey]; hstrPos = 0; scrollList = {}};
    let onLocationChange = (location, action) => {
      currKey = location.key || location.pathname;
      if (action === 'LOAD') try {
        homeKey = sessionStorage.getItem('homeKey');
        hstrList = JSON.parse(sessionStorage.getItem('hstrList'));
        scrollList = JSON.parse(sessionStorage.getItem('scrollList'));
        hstrPos = hstrList.indexOf(currKey);
        if (hstrList.indexOf(homeKey) < 0 || hstrPos < 0) throw Error();
      } catch { reset(); }
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
        if (hstrPos < 0) reset();
      }
      if (homeKey === '' && location.pathname === '/list') homeKey = currKey;
      this._deltaHome = (homeKey === '') ? null : hstrList.indexOf(homeKey) - hstrPos;
      // Double back press to exit on Android
      if (this.androidOS && location.search === '?PWASTART') {
        homeKey = '';
        this.scrollMemory = -1;
        if (action === 'POP') {
          document.documentElement.classList.add('document-lock');
          toastNotification(
            <span>Naciśnij ponownie <em>Wstecz</em>, aby zamknąć.</span>, 800
          ).then(() => {
            setTimeout(() => {
              this._history.push(location.pathname);
              document.documentElement.classList.remove('document-lock');
            }, 400);
          }); 
        } else { // if first time here
          this._history.push(location.pathname);
        }
      } else {
        this.scrollMemory = scrollList[hstrList[hstrPos]] || 0;
      }
      if (typeof this.onScrollMemoryChange === 'function') { 
        if (location.pathname !== this._prevLctn.pathname) this.onScrollMemoryChange();
        this._prevLctn = location;
      }
    };
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('homeKey', homeKey);
      sessionStorage.setItem('hstrList', JSON.stringify(hstrList));
      sessionStorage.setItem('scrollList', JSON.stringify(scrollList));
    });
    this._unlisten = hstr.listen(onLocationChange);
    onLocationChange(hstr.location, 'LOAD');
    return true;
  }
  reload = () => {
    const rld = () => window.location.reload(true);
    let delta = this._deltaHome || 0;
    if (this._deltaHome !== null && this.pwaMode && this.androidOS) delta--;
    if (delta === 0) rld(); else {
      this._unlisten();
      this._history.listen(rld);
      this._history.go(delta);
    } 
  }
  goHome = () => {
    if (!this._history) return;
    if (this._deltaHome) {
      setTimeout(() => this._history.go(this._deltaHome), this._delay); 
    } else {
      if (this._deltaHome === null) this.replace('/list'); 
    }
  }
  goBack = () => {
    if (!this._history) return;
    if (this._deltaHome < 0) {
      setTimeout(() => this._history.goBack(), this._delay); 
    } else {
      this.goHome();
    }
  }
  push = (...args) => {
    if (this._history) setTimeout(() => this._history.push(...args), this._delay);
  }
  replace = (...args) => {
    if (this._history) setTimeout(() => this._history.replace(...args), this._delay);
  }
  pathMatch = (str) => {
    return this._history.location.pathname.match(new RegExp(str, 'i'));
  }
}

export const appNav = new AppNav();

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
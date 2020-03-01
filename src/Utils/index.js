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

export function setSystemFont(value) {
  const s = document.documentElement.style;
  const d = value ? ['sans-serif', 300, 400, 500] : ["'Raleway', sans-serif", 400, 500, 600];
  s.setProperty('--main-font-family', d[0]);
  s.setProperty('--main-light-weight', d[1]);
  s.setProperty('--main-medium-weight', d[2]);
  s.setProperty('--main-bold-weight', d[3]);
}

class AppNav {
  history = null;
  deltaHome = null;
  delay = 10;
  scrollMemory = 0;
  onScrollMemoryChange = null;
  androidOS = /android/i.test(navigator.userAgent);
  pwaMode = window.location.search === '?PWASTART';
  reset() {}
  init(hstr) {
    if (!hstr || this.history) return false;
    this.history = hstr;
    if (!hstr.location.key) hstr.replace(
      hstr.location.pathname + hstr.location.search + hstr.location.hash
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
      // Double back press to exit on Android
      if (this.androidOS && location.search === '?PWASTART') {
        homeKey = '';
        this.scrollMemory = -1;
        if (action === 'POP') {
          toastNotification(<span>Naciśnij ponownie <em>Wstecz</em>, aby zamknąć.</span>, 800);
          setTimeout(() => this.history.push(location.pathname), 1200);
        } else { // if first time here
          this.history.push(location.pathname); // without search
        }
      } else {
        this.scrollMemory = scrollList[hstrList[hstrPos]] || 0;
      }
      if (typeof this.onScrollMemoryChange === 'function') this.onScrollMemoryChange();
      /* DEBUG 
      alert(
        'action: ' + action + ' pathname: ' + location.pathname + location.search + location.hash +
        '\nhomeKey: ' + homeKey + ' hstrPos: ' + hstrPos + 
        '\nhstrList: [' + hstrList.join(', ') + ']\nscrollList: ' + JSON.stringify(scrollList)
        );
      */
    };
    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('homeKey', homeKey);
      sessionStorage.setItem('hstrList', JSON.stringify(hstrList));
      sessionStorage.setItem('scrollList', JSON.stringify(scrollList));
    });
    hstr.listen(onLocationChange);
    onLocationChange(hstr.location, 'LOAD');
    return true;
  }
  goHome = () => {
    if (!this.history) return;
    if (this.deltaHome) {
      setTimeout(() => this.history.go(this.deltaHome), this.delay); 
    } else {
      if (this.deltaHome === null) this.push('/list'); 
    }
  }
  goBack = () => {
    if (!this.history) return;
    if (this.deltaHome < 0) {
      setTimeout(() => this.history.goBack(), this.delay); 
    } else {
      this.goHome();
    }
  }
  push = (...args) => {
    if (this.history) setTimeout(() => this.history.push(...args), this.delay);
  }
  replace = (...args) => {
    if (this.history) setTimeout(() => this.history.replace(...args), this.delay);
  }
  pathMatch = (str) => {
    return this.history.location.pathname.match(new RegExp(str, 'i'));
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

function getWorkingDays(time) {
  if (!(time instanceof Date)) time = time ? new Date(time) : new Date();
  time = time.getTime() - (time.getTimezoneOffset() * 60000);
  const F_UTC = 'T00:00:00.000Z';
  const DAY = 1000 * 60 * 60 * 24;
  const WEEK = DAY * 7;
  function range(begin, end) {
    begin = new Date(begin+F_UTC).getTime()
    end = (end !== undefined) ? new Date(end+F_UTC).getTime() : begin;
    return {begin: begin, end: end + DAY};
  } 
  const semester = ([
    { // semestr letni 2019/2020
      period: range('2020-02-17', '2020-05-31'),
      exclusions: [
        range('2020-04-09', '2020-04-14'),
        range('2020-05-01', '2020-05-03'),
      ]
    },
    { // semestr zimowy 2020/2021
      period: range('2020-10-01', '2021-01-27'),
      exclusions: [
        range('2020-12-23', '2021-01-03'),
        range('2020-11-01'),
        range('2020-11-11'),
        range('2021-01-06'),
      ]
    },
    { // semestr letni 2020/2021
      period: range('2021-02-15', '2021-05-30'),
      exclusions: [
        range('2021-04-01', '2021-04-06'),
        range('2021-05-01', '2021-05-03'),
      ]
    },
  ]).find(s => time >= s.period.begin && time < s.period.end);
  if (semester) {
    let res = 0;
    const timeIn = range => time >= range.begin && time < range.end;
    for (; time < semester.period.end; time += WEEK) {
      if (!semester.exclusions.find(timeIn)) res++;
    }
    return res;
  }
}

export const workingDays = getWorkingDays();
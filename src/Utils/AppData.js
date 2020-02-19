function validateProperties(rec, allowedProps) {
  let props = Object.getOwnPropertyNames(rec);
  for (let prop of props) {
    if (! (prop in allowedProps)) {
      delete rec[prop]; 
    } else {
      if (typeof rec[prop] !== allowedProps[prop]) {
        throw new Error(prop + ': ' + typeof rec[prop] + ' !== ' + allowedProps[prop]);
      }
    }
  }
}

function validateRecord(rec) {
  validateProperties(rec, {
    id: 'number', title: 'string', lessonLength: 'number', totalHours: 'number', 
    completed: 'number', nextKey: 'number', order: 'number', lessons: 'object'
  });
  if ('lessons' in rec) {
    if (!Array.isArray(rec.lessons)) throw new Error('Lessons is not an array!');
    for (let item of rec.lessons) {
      validateProperties(item, {key: 'number', time: 'number', length: 'number'});
    }
  }
}

function dynamicSort(reverse, property, param) {
  reverse = parseInt(reverse) ? -1 : 1;
  property = String(property);
  param = parseInt(param) || 0;
  return (a, b) => {
    let arg = {prop: property, prm: param}, prop = {a: a[arg.prop], b: b[arg.prop]}, result;
    if (arg.prm > 0 && arg.prop === 'completed') {
      prop = {a: (a['totalHours'] * 45) - prop.a, b: (b['totalHours'] * 45) - prop.b};
    }
    if (prop.a === prop.b && (arg.prop === 'totalHours' || arg.prop === 'completed')) {
      arg = {prm: 1, prop: 'title'};
      prop = {a: a[arg.prop], b: b[arg.prop]};
    }
    if (arg.prm > 0 && arg.prop === 'title') {
      prop.a = prop.a.trim().split(/\s+/).slice(-1)[0]; 
      prop.b = prop.b.trim().split(/\s+/).slice(-1)[0];
      if (prop.a === prop.b) prop = {a: a[arg.prop], b: b[arg.prop]};
    }
    if (typeof prop.a === 'string' && typeof prop.b === 'string') {
      result = prop.a.localeCompare(prop.b);
    } else {
      result = (prop.a < prop.b) ? -1 : (prop.a > prop.b) ? 1 : 0;
    }
    return result * reverse;
  }
}

function jsonToStdnt(str) {
  try {
    const result = JSON.parse(str);
    if (result && typeof result === 'object' && result.constructor === Object) {
      return result;
    } else { 
      throw new Error();
    }
  } catch {
    return {id: 0, order: 0, title: '', totalHours: 0, completed: 0, lessons: []};
  }
}

class AppData {
  constructor() {
    this._itemPrefix = 'SLO_';
    this._itemRegExp = new RegExp('^' + this._itemPrefix + '([0-9]+)$');
    this._nextId = parseInt(localStorage.getItem('nextId')) || 1;
  }
  _getStudents() {
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      let id = localStorage.key(i).match(this._itemRegExp);
      if (id) items.push(jsonToStdnt(localStorage.getItem(id[0])));
    }
    return items;
  }
  _setLessons(student, srcArr) {
    const keys = [];
    for (let item of srcArr) {
      const index = item.key ? student.lessons.findIndex(o => o.key === item.key) : -1;
      if (index > -1 && index < student.lessons.length) { // UPDATE
        Object.assign(student.lessons[index], item);
        keys.push(item.key);
      } else { // INSERT
        const lesson = Object.assign({time: Date.now(), length: 0, key: student.nextKey++}, item);
        student.lessons.push(lesson);
        keys.push(lesson.key);
      }
    }
    return keys;
  }
  _updateCompletedLessons(student) {
    if (Array.isArray(student.lessons)) {
      student.lessons.sort(dynamicSort(0, 'time'));
      student.completed = 0;
      for (let item of student.lessons) student.completed += item.length;
    }
  }
  get totalHours() { return parseInt(localStorage.getItem('totalHours')) || 12; }
  get lessonsReverse() { return parseInt(localStorage.getItem('lsnRvrs')) || 0; }
  set lessonsReverse(v) { localStorage.setItem('lsnRvrs', v ? 1 : 0); }
  get sortParams() { return localStorage.getItem('sortParams') || '0,order'; }
  set sortParams(s) { localStorage.setItem('sortParams', s); }
  get systemFont() { return parseInt(localStorage.getItem('sysFont')) || 0; }
  set systemFont(v) { localStorage.setItem('sysFont', v ? 1 : 0); }
  get noStretching() { return parseInt(localStorage.getItem('noStretching')) || 0; }
  set noStretching(v) { localStorage.setItem('noStretching', v ? 1 : 0); }
  get smoothScroll() { return parseInt(localStorage.getItem('smthScrl')) || 0; }
  set smoothScroll(v) { localStorage.setItem('smthScrl', v ? 1 : 0); }
  get fixedNavigationBar() { return parseInt(localStorage.getItem('fixedNavBar')) || 0; }
  set fixedNavigationBar(v) { localStorage.setItem('fixedNavBar', v ? 1 : 0); }
  importFromJSON(jsonStr) {
    try {
      let data = JSON.parse(jsonStr);
      const allowedNames = ['nextId', 'totalHours', 
        'lsnRvrs', 'sortParams', 'sysFont', 'noStretching', 'smthScrl', 'fixedNavBar'];
      Object.keys(data).forEach((key) => {
        if (key.match(this._itemRegExp) || (allowedNames.indexOf(key) > -1)) {
          localStorage.setItem(key, data[key]);
        }
      });
      this.validate();
      return true;
    } catch {
      return false;
    }
  }
  exportToJSON() {
    return JSON.stringify(localStorage);
  }
  validate() {
    let tmp = parseInt(localStorage.getItem('nextId')) || 1;
    if (this._nextId > tmp) localStorage.setItem('nextId', this._nextId); else this._nextId = tmp;
    tmp = String(localStorage.getItem('sortParams')).split(',');
    if (tmp.length >= 2) tmp = 'order'; else {
      localStorage.setItem('sortParams', '0,order');
      tmp = 'id';
    }
    this._getStudents().sort(dynamicSort(0, tmp)).forEach((student, index) => {
      validateRecord(student);
      student.order = (index + 1) * 1000000;
      student.nextKey = 1;
      student.lessons.forEach(o => o.key = student.nextKey++);
      this._updateCompletedLessons(student);
      localStorage.setItem(this._itemPrefix + student.id, JSON.stringify(student));
    });
  }
  updateOrder() {
    this._getStudents().sort(dynamicSort(0, 'order')).forEach((student, index) => {
      student.order = (index + 1) * 1000000;
      localStorage.setItem(this._itemPrefix + student.id, JSON.stringify(student));
    });
  }
  versionEquals(configVersion) {
    let version = parseFloat(localStorage.getItem('version')) || 0;
    if (configVersion !== version) {
      localStorage.setItem('version', configVersion);
      this.validate();
      return false;
    } 
    return true;
  }
  getStudents() {
    return this._getStudents().sort(dynamicSort(...this.sortParams.split(',')));
  }
  getStudent(stdntId) {
    return jsonToStdnt(localStorage.getItem(this._itemPrefix + parseInt(stdntId)));
  }
  setStudent(rec) {
    validateRecord(rec);
    delete rec.nextKey;
    if (typeof rec.totalHours === 'number' && isFinite(rec.totalHours)) {
      localStorage.setItem('totalHours', rec.totalHours);
    }
    let student = this.getStudent(rec.id), keys = [];
    if (student.id) { // UPDATE
      if ('lessons' in rec) {
        keys = this._setLessons(student, rec.lessons);
        delete rec.lessons;
      }
      this._updateCompletedLessons(student);
      localStorage.setItem(this._itemPrefix + rec.id, JSON.stringify(Object.assign(student, rec)));
    } else { // INSERT
      if (!(rec.id > 0)) {
        rec.id = this._nextId;
        localStorage.setItem('nextId', ++this._nextId);
      }
      if (!(rec.order > 0)) rec.order = rec.id * 1000000;
      student = {title: 'student-' + rec.id, nextKey: 1, 
        totalHours: 0, completed: 0, lessonLength: 45, lessons: []};
      if ('lessons' in rec) {
        keys = this._setLessons(student, rec.lessons);
        delete rec.lessons;
      }
      this._updateCompletedLessons(student);
      localStorage.setItem(this._itemPrefix + rec.id, JSON.stringify(Object.assign(student, rec)));
    }
    return {id: rec.id, lessons: keys.map(v => (
      {key: v, index: student.lessons.findIndex(o => o.key === v)}
    ))};
  }
  removeStudent(stdntId, keys) {
    const student = this.getStudent(stdntId);
    if (student.id) {
      if (keys) { // remove lesson
        if (!Array.isArray(keys)) keys = [keys];
        const deleted = student.lessons.filter(o => keys.indexOf(o.key) > -1);
        if (deleted.length) {
          student.lessons = student.lessons.filter(o => keys.indexOf(o.key) < 0);
          this._updateCompletedLessons(student);
          localStorage.setItem(this._itemPrefix + stdntId, JSON.stringify(student));
          return deleted;
        }
      } else { // remove student
        localStorage.removeItem(this._itemPrefix + stdntId);
        return student;
      }
    }
    return false;
  }
  clearLessons() {
    for (let i = 0; i < localStorage.length; i++) {
      const id = localStorage.key(i).match(this._itemRegExp);
      if (!id) continue;
      const student = jsonToStdnt(localStorage.getItem(id[0]));
      Object.assign(student, {completed: 0, lessons: [], nextKey: 1});
      localStorage.setItem(this._itemPrefix + student.id, JSON.stringify(student));
    }
  }
  clearData() {
    this._nextId = 1;
    const version = localStorage.getItem('version');
    localStorage.clear();
    localStorage.setItem('version', version);
  }
  getSize() {
    let total = 0, p;
    for (p in localStorage) {
      if (localStorage.hasOwnProperty(p)) total += ((localStorage[p].length + p.length) * 2);
    }
    return (total / 1024).toFixed(2);
  }
}

export default new AppData();
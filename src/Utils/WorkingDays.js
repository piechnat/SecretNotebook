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
        range('2020-03-11', '2020-03-29'),
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

const workingDays = getWorkingDays();

export default workingDays;
import moment from 'moment';

const periodFormat = (start: moment.MomentInput, end: moment.MomentInput, format = 'YYYY-MM-DD, HH:mm:ss') => {
  let from = start === 'unknown' ? '' : moment(start).format(format);
  let to = end === 'unknown' ? '' : moment(end).format(format);
  if (!to) {
    // only format one time
    from = from === 'Invalid date' ? 'n/a' : from;
    return `${from}`;
  }
  if (from === 'Invalid date' && to === 'Invalid date') {
    return 'n/a';
  }
  from = from === 'Invalid date' ? 'n/a' : from;
  to = to === 'Invalid date' ? 'n/a' : to;
  return `${from} ~ ${to}`;
};

export default periodFormat;

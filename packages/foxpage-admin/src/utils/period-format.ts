import dayjs from 'dayjs';

export const periodFormat = (start: string = 'unknown', end: string = 'unknown', format = 'YYYY-MM-DD, HH:mm:ss') => {
  let from = start === 'unknown' ? '' : dayjs(start).format(format);
  let to = end === 'unknown' ? '' : dayjs(end).format(format);
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

export default { periodFormat };

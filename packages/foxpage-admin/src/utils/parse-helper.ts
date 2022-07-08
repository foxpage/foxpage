export const safeParse = (
  data: string,
  option: {
    backup?: any;
    onErr?(...args: unknown[]): void;
  } = {
    backup: {},
  },
) => {
  const { backup, onErr } = option;
  let res = backup;
  try {
    res = JSON.parse(data);
  } catch (e) {
    if (onErr) {
      onErr(e);
    } else {
      console.error(e);
    }
  }
  return res;
};

export const getAbsoluteTypes = (o: any) => {
  return Object.prototype.toString.call(o).slice(8, -1).toLocaleLowerCase();
};

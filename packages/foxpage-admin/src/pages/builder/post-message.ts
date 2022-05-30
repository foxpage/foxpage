/**
 * post message
 * @param data msg data
 */
export const postMsg = (type: string, data: any) => {
  // @ts-ignore
  const frameWin = document.getElementById('main-view')?.contentWindow;
  if (frameWin) {
    frameWin.postMessage(
      {
        type,
        ...data,
      },
      '*',
    );
  }
};

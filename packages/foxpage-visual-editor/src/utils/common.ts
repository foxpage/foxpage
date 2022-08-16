export const getFrameDoc = () => {
  //@ts-ignore
  return window.document.getElementById('component-viewer')?.contentDocument;
};

export const getFrameWin = () => {
  //@ts-ignore
  return window.document.getElementById('component-viewer')?.contentWindow;
};


export const getRootRect = () => {
  return window.document.getElementById('component-viewer')?.getBoundingClientRect();
};
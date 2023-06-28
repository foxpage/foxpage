export const isIFrame = (input: HTMLElement | null): input is HTMLIFrameElement =>
  input !== null && input.tagName === 'IFRAME';

export const getFrameDoc = () => {
  const frame = window.document.getElementById('component-viewer');
  return isIFrame(frame) && frame.contentDocument ? frame.contentDocument : null;
};

export const getFrameWin = () => {
  const frame = window.document.getElementById('component-viewer');
  return isIFrame(frame) && frame.contentWindow ? frame.contentWindow : null;
};

export const getRootRect = () => {
  const frame = window.document.getElementById('component-viewer');
  return frame?.getBoundingClientRect();
};

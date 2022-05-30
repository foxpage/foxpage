var iframe = document.getElementById('main-view');

let iframeWindow: Window = window;
// let dragSelected: boolean = false;

export const handleStartDrag = (e: MouseEvent, data: any) => {
  // dragSelected = true;
  iframeWindow?.postMessage(
    {
      type: 'onDrag',
      data,
    },
    '*',
  );
  // @ts-ignore
  e.target.style.cursor = 'move';
};

export const handleDragEnd = () => {
  // dragSelected = false;
  iframeWindow?.postMessage(
    {
      type: 'onEnd',
      data: {},
    },
    '*',
  );
};

export const dndHandler = (iframeWin: Window) => {
  iframeWindow = iframeWin;

  document.addEventListener('mouseup', () => {
    // console.log('----------------mouseup');
    handleDragEnd();
  });

  document.addEventListener('mousemove', (_e) => {
    // if (dragSelected) {
    //   console.log('----------------mousemove');
    //   // @ts-ignore
    //   if (e.target && e.target.style && e.target.style.cursor) {
    //     // @ts-ignore
    //     e.target.style.cursor = 'move';
    //   }
    // } else {
    //   // @ts-ignore
    //   if (e.target && e.target.style && e.target.style.cursor) {
    //     // @ts-ignore
    //     e.target.style.cursor = '';
    //   }
    // }
  });

  let rect = iframe?.getBoundingClientRect() || { left: 0, top: 0 };

  window.onmessage = function(e) {
    if (e.data.type === 'mousemove') {
      const pos = {
        clientX: e.data.data?.clientX + rect.left,
        clientY: e.data.data?.clientY + rect.top,
      };
      document.dispatchEvent(new MouseEvent('mousemove', pos));
    } else if (e.data.type === 'mouseup') {
      const pos = {
        clientX: e.data.data?.clientX + rect.left,
        clientY: e.data.data?.clientY + rect.top,
      };
      document.dispatchEvent(new MouseEvent('mouseup', pos));
    }
  };
};

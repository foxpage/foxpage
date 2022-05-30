import { postMsg } from '../../post-message';
import {
  DROP_CONTAINER,
  DROP_CONTAINER_DROP_IN,
  DROP_CONTAINER_NODE,
  DROP_CONTAINER_NODE_TYPE,
} from '../constant';

function getDropRoot(node: any): HTMLElement | null {
  if (
    typeof node?.getAttribute === 'function' &&
    node.getAttribute('data-node') === DROP_CONTAINER_NODE &&
    node.getAttribute('data-node-type') === DROP_CONTAINER_NODE_TYPE &&
    node.getAttribute('data-node-drag-in') === DROP_CONTAINER_DROP_IN
  ) {
    return node;
  }
  if (node.parentNode) {
    return getDropRoot(node.parentNode);
  }
  return null;
}

const getRoot = () => {
  return document.getElementById(DROP_CONTAINER);
};

// drag enter event handle
const handleDragEnter = (node: HTMLElement | null) => {
  node?.dispatchEvent(new DragEvent('dragenter', {}));
};

// drag over event handle
const handleDragOver = (e: MouseEvent) => {
  e?.target?.dispatchEvent(
    new DragEvent('dragover', {
      clientY: e.clientY,
      clientX: e.clientX,
      bubbles: true,
    }),
  );
};

// drag drop event handle
const handleDragDrop = (e: MouseEvent, data: DataTransfer) => {
  e?.target?.dispatchEvent(
    new DragEvent('drop', {
      clientY: e.clientY,
      clientX: e.clientX,
      bubbles: true,
      dataTransfer: data,
    }),
  );
};

// drag leave event handle
const handleDragLeave = (node = getRoot()) => {
  node?.dispatchEvent(new DragEvent('dragleave', {}));
};

// drag exit event handle
const handleDragExit = (node = getRoot()) => {
  node?.dispatchEvent(new DragEvent('dragexit', {}));
};

/**
 * drag handler
 */
export const dragHandler = () => {
  let dsl: any = null;
  let onDrag = false;

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (dsl) {
      // // @ts-ignore
      // if (e.target && e.target.style && e.target.style.cursor) {
      //   // @ts-ignore
      //   e.target.style.cursor = 'move';
      // }
      const dropRoot = getDropRoot(e.target);

      // check drag enter\leave\over...
      if (onDrag) {
        if (!dropRoot) {
          onDrag = false;
          handleDragLeave();
        } else {
          handleDragOver(e);
        }
      } else {
        if (dropRoot) {
          onDrag = true;
          handleDragEnter(dropRoot);
        } else {
          handleDragExit();
        }
      }
    }

    postMsg('mousemove', {
      data: {
        clientY: e.clientY,
        clientX: e.clientX,
      },
    });
  });

  document.addEventListener('mouseup', (e) => {
    if (dsl) {
      if (onDrag) {
        // drop event & send data
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('data-dsl', JSON.stringify(dsl));
        handleDragDrop(e, dataTransfer);
      } else {
        handleDragExit();
      }

      dsl = null;
    }
    // // @ts-ignore
    // if (e.target && e.target.style && e.target.style.cursor) {
    //   // @ts-ignore
    //   e.target.style.cursor = '';
    // }
    postMsg('mouseup', {
      data: {
        clientY: e.clientY,
        clientX: e.clientX,
      },
    });
  });

  window.onmessage = function(e) {
    if (e.data.type === 'onDrag') {
      if (!dsl) {
        dsl = e.data?.data?.dsl;
      }
    } else if (e.data.type === 'onEnd') {
      // handleDragExit();
      dsl = null;
    }
  };
};

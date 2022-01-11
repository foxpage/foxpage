export function getContentElement(el: HTMLElement): void {
  //   if (!el) {
  //     return null;
  //   }
  //   if (el.contentEditable === 'inherit') {
  //     return getContentElement(el.parentElement);
  //   }
  //   if (el.contentEditable === 'true') {
  //     return el;
  //   }
  //   return null;
}

const hasChildren = (target: { children: string | any[] }) =>
  target.children.length > 0 && target.children[0].getAttribute('data-parent-id');
const hasParent = (target: { getAttribute: (arg0: string) => any }) => target.getAttribute('data-parent-id');

const getComponentStyle = (element: {
  style: { [x: string]: any; width?: any; height?: any; left?: any; top?: any; transform?: any };
}) => {
  //   const { width, height, left, top, transform } = element.style;
  //   const style = {
  //     left: Number(left.replace('px', '')) || 0,
  //     top: Number(top.replace('px', '')) || 0,
  //     height: Number(height.replace('px', '')) || undefined,
  //     width: Number(width.replace('px', '')) || undefined,
  //     rotate: Number(transform.replace('rotate(', '').replace('deg)', '')) || 0,
  //     'z-index': element.style['z-index'] || undefined,
  //   };
  //   return style;
};

const saveComonent = (target: any, selectTargets: any[]) => {
  // if (target) {
  //   window.parent.postMessage({
  //     type: 'iframe_save_component',
  //     comonents: selectTargets.map((selectTarget: { style?: any; id?: any; }) => {
  //       const { id } = selectTarget;
  //       const {
  //         width = '', height = '', left = '', top = '', transform = '',
  //       } = selectTarget.style;
  //       const style = {
  //         left: Number(left.replace('px', '')) || 0,
  //         top: Number(top.replace('px', '')) || 0,
  //         height: Number(height.replace('px', '')) || undefined,
  //         width: Number(width.replace('px', '')) || undefined,
  //         rotate: Number(transform.replace('rotate(', '').replace('deg)', '')) || 0,
  //         'z-index': selectTarget.style['z-index'] || 10,
  //       };
  //       return {
  //         componentId: id,
  //         style,
  //       };
  //     }),
  //   });
  // }
};

const setGroupStyle = (
  parentId: any,
  target: { parentElement: any },
  parentPosition: { left: number; top: number },
  cb: (arg0: any, arg1: number[]) => void,
) => {
  // const { parentElement } = target;
  // const parentOriginStyle = getComponentStyle(parentElement); // 父元素属性
  // let clonedParent = parentElement;
  // if (parentOriginStyle.rotate) {
  //   clonedParent = parentElement.cloneNode(true);
  //   clonedParent.style.transform = 'rotate(0)';
  //   clonedParent.style.opacity = 0;
  //   parentElement.parentElement.appendChild(clonedParent);
  // }
  // const { children: allChildren } = clonedParent;
  // const allChildrenRects = []; // 所有子元素rect
  // const allChildrenArray = [];// 所有子元素style
  // for (let i = 0; i < allChildren.length; i++) {
  //   allChildrenRects.push(allChildren[i].getBoundingClientRect());
  //   allChildrenArray.push(allChildren[i]);
  // }
  // const minLeft = Math.min(...allChildrenRects.map(item => item.left)) - parentPosition.left;
  // const maxRight = Math.max(...allChildrenRects.map(item => item.right)) - parentPosition.left;
  // const minTop = Math.min(...allChildrenRects.map(item => item.top)) - parentPosition.top;
  // const maxBottom = Math.max(...allChildrenRects.map(item => item.bottom)) - parentPosition.top;
  // const parentStyle = {
  //   ...parentOriginStyle,
  //   left: Number(minLeft.toFixed(1)) || 0,
  //   top: Number(minTop.toFixed(1)) || 0,
  //   width: Number((maxRight - minLeft).toFixed(1)) || 0,
  //   height: Number((maxBottom - minTop).toFixed(1)) || 0,
  // };
  // // old.xx-(old.xx/2 - new.xx/2)
  // // 设置父节点属性
  // parentElement.style.left = `${minLeft.toFixed(1)}px`;
  // parentElement.style.top = `${minTop.toFixed(1)}px`;
  // parentElement.style.width = `${(maxRight - minLeft).toFixed(1)}px`;
  // parentElement.style.height = `${(maxBottom - minTop).toFixed(1)}px`;
  // cb(parentElement, [minLeft, minTop]);
  // window.parent.postMessage({
  //   type: 'iframe_merge_component',
  //   parentComponent: {
  //     id: parentId,
  //     style: parentStyle,
  //   },
  //   children: allChildrenArray.map((element, index) => {
  //     const childStyle = getComponentStyle(element);
  //     const left = (childStyle.left + parentOriginStyle.left) - parentStyle.left;
  //     const top = (childStyle.top + parentOriginStyle.top) - parentStyle.top;
  //     // 设置子节点属性
  //     parentElement.children[index].style.left = `${left}px`;
  //     parentElement.children[index].style.top = `${top}px`;
  //     cb(parentElement.children[index], [left, top]);
  //     return {
  //       id: element.id,
  //       componentId: element.id,
  //       style: {
  //         ...childStyle,
  //         left,
  //         top,
  //       },
  //     };
  //   }),
  //   refresh: false,
  // });
  // if (parentOriginStyle.rotate) {
  //   clonedParent.remove();
  // }
};

const saveChildren = (target: { children: string | any[]; id: any }) => {
  // const allChildren = [];
  // for (let i = 0; i < target.children.length; i++) {
  //   const element = target.children[i];
  //   allChildren.push({
  //     id: element.id,
  //     componentId: element.id,
  //     style: getComponentStyle(element),
  //   });
  // }
  // window.parent.postMessage({
  //   type: 'iframe_merge_component',
  //   parentComponent: {
  //     id: target.id,
  //     style: getComponentStyle(target),
  //   },
  //   children: allChildren,
  //   refresh: false,
  // });
};

export { getComponentStyle, hasChildren, hasParent, saveChildren,saveComonent, setGroupStyle };

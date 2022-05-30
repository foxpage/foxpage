export const postMsg = (type: string, data: any) => {
  window.parent.postMessage(
    {
      ...data,
      type,
    },
    '*',
  );
};

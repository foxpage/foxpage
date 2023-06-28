export const padding = {
  padding: '8px 12px',
};

export const padding0 = {
  padding: '0px',
};

export const drawerStyle = {
  title: padding,
  body: {
    ...padding0,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'hidden',
  },
  drawer: {
    position: 'absolute',
    top: 48,
    left: 40,
    zIndex: 50,
    boxShadow: 'rgba(0, 0, 0, 0.1) 4px 4px 4px 2px',
    overflowY: 'auto',
    height: 'calc(100% - 48px)',
  },
};

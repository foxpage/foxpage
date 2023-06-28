import React from 'react';

export const Scrollbar = ({ children, ...rest }) => (
  <div className="scroll-bar relative overflow-y-auto min-h-0 flex-1" {...rest}>
    {/* Do not delete flex-1 class here! Never! */}
    {children}
  </div>
);

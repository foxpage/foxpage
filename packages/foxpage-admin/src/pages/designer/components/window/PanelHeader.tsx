import React, { ReactNode } from 'react';

interface IProps {
  title?: string;
  extra?: ReactNode;
}

const PanelHeader = (props: IProps) => {
  const { title, extra } = props;

  return (
    <div className="flex box-content items-center px-3 py-2 border-b border-b-solid border-b-gray-100">
      <>
        <div className="grow text-sm font-medium flex">{title}</div>
        {extra}
      </>
    </div>
  );
};

export default PanelHeader;

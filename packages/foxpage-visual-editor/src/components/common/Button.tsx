import React, { ReactNode } from 'react';

interface IProps {
  icon?: ReactNode | (() => ReactNode);
  onClick?: () => void;
}

const CusButton = (props: IProps) => {
  const { icon, onClick } = props;
  return (
    <div
      className="w-5 h-5 flex rounded items-center justify-center text-sm hover:cursor-pointer hover:bg-gray-100"
      onClick={onClick}>
      {typeof icon === 'function' ? icon() : icon}
    </div>
  );
};

export default CusButton;

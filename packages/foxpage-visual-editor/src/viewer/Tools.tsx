import React, { useContext, useEffect, useState } from 'react';

import { EditorContext } from '@/context/index';
import { getFrameWin } from '@/utils/index';

import { CalibrationLine, ComponentFocus, SelectedLabel } from './label';

interface IProps {
  placeholder: Record<string, any>;
}

const Tools = (props: IProps) => {
  const [time, setTime] = useState(0);
  const { selectNode, selectNodeFrom, zoom } = useContext(EditorContext);
  const { placeholder } = props;

  const handleUpdateTime = () => {
    setTimeout(() => {
      setTime(new Date().getTime());
    }, 300);
  };

  useEffect(() => {
    getFrameWin() && getFrameWin().addEventListener('resize', handleUpdateTime);
    return () => {
      getFrameWin() && getFrameWin().removeEventListener('resize', handleUpdateTime);
    };
  }, []);

  return (
    <>
      <ComponentFocus
        key={`component-focus-${time}`}
        selectId={selectNode?.id || ''}
        selectFrom={selectNodeFrom}
      />
      <SelectedLabel key={time} />
      <CalibrationLine {...placeholder} zoom={zoom} />
    </>
  );
};

export default Tools;

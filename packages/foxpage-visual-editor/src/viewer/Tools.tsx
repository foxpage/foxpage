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
  const win = getFrameWin();

  let timer;
  
  const handleUpdateTime = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      setTime(new Date().getTime());
      timer = null;
    }, 100);
  };

  useEffect(() => {
    if (win) {
      win.addEventListener('resize', handleUpdateTime);
      return () => {
        win.removeEventListener('resize', handleUpdateTime);
      };
    }
  }, [win]);

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

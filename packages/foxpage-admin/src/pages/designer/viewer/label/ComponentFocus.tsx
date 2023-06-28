import { useEffect } from 'react';

import { getFrameDoc } from '../../utils';

interface IProps {
  selectId: string;
  selectFrom?: 'viewer' | 'sider';
}

const ComponentFocus = (props: IProps) => {
  const { selectId } = props;

  useEffect(() => {
    if (selectId) {
      // viewer
      const element = getFrameDoc()?.getElementById(selectId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [selectId]);

  return null;
};

export default ComponentFocus;

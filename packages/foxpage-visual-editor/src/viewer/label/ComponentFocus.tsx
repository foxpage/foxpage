import { useEffect } from 'react';

import { getFrameDoc } from '@/utils/index';

interface IProps {
  selectId: string;
  selectFrom?: 'viewer' | 'sider';
}

const ComponentFocus = (props: IProps) => {
  const { selectId, selectFrom } = props;

  useEffect(() => {
    if (selectId) {
      // viewer
      if (selectFrom === 'sider') {
        const element = getFrameDoc()?.getElementById(selectId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      }

      // sider
      if (selectFrom === 'viewer') {
        const sideElement = document.getElementById(selectId);
        if (sideElement) {
          sideElement.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
        }
      }
    }
  }, [selectId, selectFrom]);

  return null;
};

export default ComponentFocus;

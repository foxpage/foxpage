import { useEffect } from 'react';

interface IProps {
  selectId: string;
}

export const ComponentFocus = (props: IProps) => {
  const { selectId } = props;

  useEffect(() => {
    const element = window.document.getElementById(selectId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [window, selectId]);

  return null;
};

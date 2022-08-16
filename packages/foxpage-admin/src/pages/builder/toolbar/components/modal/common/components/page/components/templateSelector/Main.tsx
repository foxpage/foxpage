import React, { useContext } from 'react';

import { Button, Typography } from 'antd';
import styled from 'styled-components';

import { Label } from '@/components/widgets/group';
import { GlobalContext } from '@/pages/system';

const EditorRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const { Text } = Typography;

interface Type {
  templateId?: string;
  disabled: boolean;
  onClick: () => void;
}

const Main: React.FC<Type> = (props) => {
  const { templateId, disabled, onClick } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;

  return (
    <React.Fragment>
      <EditorRow>
        <Label>{file.template}</Label>
        <Button type="dashed" size="small" disabled={disabled} onClick={onClick}>
          {global.select}
        </Button>
      </EditorRow>
      <Text>{templateId}</Text>
    </React.Fragment>
  );
};

export default Main;

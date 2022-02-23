import React, { useContext } from 'react';

import { Button, Typography } from 'antd';
import styled from 'styled-components';

import { Field, Label } from '@/components/widgets/group';
import GlobalContext from '@/pages/GlobalContext';

const EditorRow = styled.div`
  display: flex;
  justify-content: space-between;
`;
const { Text } = Typography;
const TemplateEditor: React.FC<{ templateId?: string; onSelect: () => void }> = props => {
  const { templateId, onSelect } = props;
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;
  return (
    <React.Fragment>
      <Field>
        <EditorRow>
          <Label>{file.template}</Label>
          <Button type="dashed" size="small" onClick={onSelect}>
            {global.select}
          </Button>
        </EditorRow>
        <Text>{templateId}</Text>
      </Field>
    </React.Fragment>
  );
};

export default TemplateEditor;

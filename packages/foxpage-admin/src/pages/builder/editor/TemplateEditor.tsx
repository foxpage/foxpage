import React from 'react';

import { Button, Typography } from 'antd';
import styled from 'styled-components';

import { Field, Label } from '@/components/widgets/group';

const EditorRow = styled.div`
  display: flex;
  justify-content: space-between;
`;
const { Text } = Typography;
const TemplateEditor: React.FC<{ templateId?: string; onSelect: () => void }> = props => {
  const { templateId, onSelect } = props;
  return (
    <React.Fragment>
      <Field>
        <EditorRow>
          <Label>Template</Label>
          <Button type="dashed" size="small" onClick={onSelect}>
            Select
          </Button>
        </EditorRow>
        <Text>{templateId}</Text>
      </Field>
    </React.Fragment>
  );
};

export default TemplateEditor;

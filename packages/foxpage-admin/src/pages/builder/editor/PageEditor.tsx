import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Input } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/template';
import { updatePageTemplateSelectModalOpen } from '@/actions/builder/template-select';
import { Field, Label, Title } from '@/components/widgets/group';
import { getPageTemplateId } from '@/services/builder';

import TemplateEditor from './TemplateEditor';

const Group = styled.div`
  background: #fafafa;
  padding: 12px 16px;
`;

const mapStateToProps = (store: RootState) => ({
  version: store.builder.template.version,
});

const mapDispatchToProps = {
  updatePageInfo: ACTIONS.updatePageBasicInfo,
  updatePageTemplateSelectModalOpen: updatePageTemplateSelectModalOpen,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;
const PageEditor: React.FC<Type> = props => {
  const { version, updatePageInfo, updatePageTemplateSelectModalOpen } = props;
  const { content: { schemas = [] } = {} } = version;
  const [templateId, setTemplateId] = useState<string | undefined>();

  useEffect(() => {
    setTemplateId(getPageTemplateId(version));
  }, [version]);

  if (schemas.length === 0) {
    return null;
  }

  const componentProps = schemas[0]?.props;
  return (
    <Group>
      <Title>Page Style</Title>
      <Field>
        <Label>Height</Label>
        <Input
          width={120}
          defaultValue={(componentProps?.height as unknown as string) || ''}
          onBlur={e => {
            updatePageInfo('height', e.target.value);
          }}
        />
      </Field>

      <Field>
        <Label>Width</Label>
        <Input
          width={120}
          defaultValue={(componentProps?.width as unknown as string) || ''}
          maxLength={30}
          placeholder="Label"
          onBlur={e => {
            updatePageInfo('width', e.target.value);
          }}
        />
      </Field>
      <TemplateEditor
        templateId={templateId}
        onSelect={() => {
          updatePageTemplateSelectModalOpen(true);
        }}
      />
    </Group>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PageEditor);

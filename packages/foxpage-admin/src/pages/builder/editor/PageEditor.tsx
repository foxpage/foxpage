import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Input } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/template';
import { updatePageTemplateSelectModalOpen } from '@/actions/builder/template-select';
import { Field, Label, Title } from '@/components/widgets/group';
import GlobalContext from '@/pages/GlobalContext';
import { getPageTemplateId } from '@/services/builder';

import TemplateEditor from './TemplateEditor';

const Group = styled.div`
  background: #ffffff;
  padding: 12px 16px;
`;

const mapStateToProps = (store: RootState) => ({
  version: store.builder.template.version,
  baseContent: store.builder.template.extensionData.baseContent,
});

const mapDispatchToProps = {
  updatePageInfo: ACTIONS.updatePageBasicInfo,
  updatePageTemplateSelectModalOpen: updatePageTemplateSelectModalOpen,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;
const PageEditor: React.FC<Type> = (props) => {
  const { version, baseContent, updatePageInfo, updatePageTemplateSelectModalOpen } = props;
  const { content: { schemas = [] } = {} } = version;
  const [templateId, setTemplateId] = useState<string | undefined>();
  const { locale } = useContext(GlobalContext);
  const { global, builder } = locale.business;
  useEffect(() => {
    setTemplateId(getPageTemplateId(version));
  }, [version]);

  if (schemas.length === 0) {
    return null;
  }

  const componentProps = schemas[0]?.props;
  return (
    <Group>
      <Title>{builder.pageStyle}</Title>
      <Field>
        <Label>{global.height}</Label>
        <Input
          width={120}
          defaultValue={((componentProps?.height as unknown) as string) || ''}
          onBlur={(e) => {
            updatePageInfo('height', e.target.value);
          }}
        />
      </Field>

      <Field>
        <Label>{global.width}</Label>
        <Input
          width={120}
          defaultValue={((componentProps?.width as unknown) as string) || ''}
          maxLength={30}
          placeholder="Label"
          onBlur={(e) => {
            updatePageInfo('width', e.target.value);
          }}
        />
      </Field>
      <TemplateEditor
        templateId={templateId}
        disabled={!!baseContent}
        onSelect={() => {
          updatePageTemplateSelectModalOpen(true);
        }}
      />
    </Group>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PageEditor);

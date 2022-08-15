import React, { useContext, useEffect, useState } from 'react';

import { Input } from 'antd';
import styled from 'styled-components';

import { Field, Label, Title } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { StructureNode } from '@/types/index';

import { TemplateSelector } from './components';

const Group = styled.div`
  background: #ffffff;
  padding: 12px 16px;
`;

interface Type {
  pageNode: StructureNode;
  openModal: (open: boolean, type?: string) => void;
  onPageNodeChange: (data: StructureNode) => void;
}

const Main: React.FC<Type> = (props) => {
  const [templateId, setTemplateId] = useState<string | undefined>();
  const { pageNode, openModal, onPageNodeChange } = props;
  const { width, height } = pageNode.props || {};
  const { tpl = '' } = pageNode.directive || {};
  const { extendId = '' } = pageNode.extension || {};

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, builder } = locale.business;

  useEffect(() => {
    const templateId = tpl.split(':')[1];
    setTemplateId(templateId);
  }, [pageNode]);

  const updatePageInfo = (key, value) => {
    const props = { ...pageNode.props };
    props[key] = value;
    onPageNodeChange({ ...pageNode, props });
  };

  const handleClick = () => {
    if (typeof openModal === 'function') openModal(true, 'template');
  };

  return (
    <Group>
      <Title>{builder.pageStyle}</Title>
      <Field>
        <Label>{global.height}</Label>
        <Input
          width={120}
          defaultValue={height || ''}
          onBlur={(e) => {
            updatePageInfo('height', e.target.value);
          }}
        />
      </Field>
      <Field>
        <Label>{global.width}</Label>
        <Input
          width={120}
          defaultValue={width || ''}
          maxLength={30}
          placeholder="Label"
          onBlur={(e) => {
            updatePageInfo('width', e.target.value);
          }}
        />
      </Field>
      <Field>
        <TemplateSelector templateId={templateId} disabled={!!extendId} onClick={handleClick} />
      </Field>
    </Group>
  );
};
export default Main;

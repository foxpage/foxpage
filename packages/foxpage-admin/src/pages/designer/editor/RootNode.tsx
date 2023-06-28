import React from 'react';

import { Button } from 'antd';

import { RenderStructureNode } from '@/types/index';

import { Field, Group, Label, Title } from '../components';
import { useFoxpageContext } from '../context';

interface IProps {
  node: RenderStructureNode;
}

// TODO:
const getTemplateId = (directive: RenderStructureNode['directive'] = {}) => {
  const { tpl = '' } = directive;
  return tpl.split(':')[1];
};

const RootNodeEditor = (props: IProps) => {
  const { foxI18n, events, config } = useFoxpageContext();
  const { node } = props;
  const { onWindowChange } = events;
  const { templateBind = false, disableTemplateBind = true } = node.__editorConfig || {};

  const handleTemplateBind = () => {
    if (typeof onWindowChange === 'function') {
      onWindowChange('templateBind', {
        status: true,
        component: node,
      });
    }
  };

  if (!templateBind) {
    return null;
  }

  const tplId = getTemplateId(node.directive);

  return (
    <Group>
      <Title>{foxI18n.advance}</Title>
      <Field>
        <Label>{foxI18n.template}</Label>
        <Field>
          <span style={{ display: 'inline-block' }}>{tplId}</span>
          {!config.sys?.readOnly && (
            <Button
              type="dashed"
              size="small"
              style={{ float: 'right' }}
              disabled={disableTemplateBind}
              onClick={handleTemplateBind}>
              {foxI18n.select}
            </Button>
          )}
        </Field>
      </Field>
    </Group>
  );
};

export default RootNodeEditor;

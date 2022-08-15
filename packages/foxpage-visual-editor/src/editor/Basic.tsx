import React, { useContext } from 'react';

import { Input, Select } from 'antd';
import styled from 'styled-components';

import { FoxContext } from '@/context/index';

import { Field, Label } from '../components/group';

const Group = styled.div`
  background: #fafafa;
`;

const { Option } = Select;

interface IProps {
  id: string;
  label: string;
  name: string;
  version: string;
  onChange: (key: string, val: string) => void;
  onApplyState: () => void;
}

const Basic = (props: IProps) => {
  const { id, label, name, version, onChange, onApplyState } = props;
  const { foxI18n } = useContext(FoxContext);

  return (
    <div style={{ padding: 12 }}>
      <Group>
        <Field>
          <Label>Id</Label>
          <Input value={id} disabled />
        </Field>

        <Field>
          <Label>{foxI18n.label}</Label>
          <Input
            value={label}
            maxLength={30}
            placeholder="Label"
            onChange={(e) => {
              onChange('label', e.target.value);
            }}
            onBlur={() => {
              onApplyState();
            }}
          />
        </Field>

        <Field>
          <Label>{foxI18n.name}</Label>
          <Input value={name} disabled />
        </Field>
        <Field>
          <Label>{foxI18n.version}</Label>
          <Select disabled value={version} style={{ width: '100%' }}>
            <Option value={version}>{version}</Option>
          </Select>
        </Field>
      </Group>
    </div>
  );
};

export default Basic;

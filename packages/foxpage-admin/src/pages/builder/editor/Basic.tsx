import React from 'react';

import { Input, Select } from 'antd';
import styled from 'styled-components';

import { Field, Label } from '../../components/widgets/group';

const Group = styled.div`
  background: #fafafa;
`;

const { Option } = Select;

interface BasicProps {
  id: string;
  label: string;
  name: string;
  version: string;
  onChange: (key: string, val: string) => void;
  onApplyState: (key: string, val: string) => void;
}
const Basic: React.FC<BasicProps> = props => {
  const { id, label, name, version, onChange, onApplyState } = props;

  return (
    <div style={{ padding: 12 }}>
      <Group>
        <Field>
          <Label>Id</Label>
          <Input value={id} disabled />
        </Field>

        <Field>
          <Label>Label</Label>
          <Input
            value={label}
            maxLength={30}
            placeholder="Label"
            onChange={e => {
              onChange('label', e.target.value);
            }}
            onBlur={e => {
              onApplyState('label', e.target.value);
            }}
          />
        </Field>

        <Field>
          <Label>Name</Label>
          <Input value={name} disabled />
        </Field>
        <Field>
          <Label>Version</Label>
          <Select disabled value={version} style={{ width: '100%' }}>
            <Option value={version}>{version}</Option>
          </Select>
        </Field>
      </Group>
    </div>
  );
};

export default Basic;

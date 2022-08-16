import React, { useContext } from 'react';
import MdEditor from 'react-markdown-editor-lite';

// import { FireFilled } from '@ant-design/icons';
import { Input, InputNumber } from 'antd';
import MarkdownIt from 'markdown-it';
import styled from 'styled-components';

import { Field, Group, Label } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { CategoryType, Component } from '@/types/index';

// import { getRankColor } from '../rank';
import Category from './Category';

// import CoverUpload from './CoverUpload';
import 'react-markdown-editor-lite/lib/index.css';

const TooltipContainer = styled.p`
  color: #f90;
  font-size: 12px;
`;

interface IProps {
  category?: Component['category'];
  categories: CategoryType[];
  onChange: (data: Component['category']) => void;
}

function BasicInfoPanel(props: IProps) {
  const { category, categories, onChange } = props;
  const { name, categoryName = '', groupName = '', sort, description } = category || {};

  const mdParser = new MarkdownIt();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { category: i18n } = locale.business;

  const handleValueChange = (key, value) => {
    if (value && /{{+.+}}/.test(value)) {
      return;
    }
    onChange(Object.assign({}, category, { [key]: value }));
  };

  const handleEditorChange = ({ text }) => {
    handleValueChange('description', text);
  };

  return (
    <div>
      <Group>
        <Field>
          <Label>
            {i18n.label} <span style={{ color: 'red' }}>*</span>
          </Label>
          <Input
            value={name}
            maxLength={30}
            placeholder="Name"
            onChange={(e) => handleValueChange('name', e.target.value)}
          />
        </Field>

        <Field>
          <Label>{i18n.category}</Label>
          <Category
            categoryName={categoryName}
            groupName={groupName}
            categories={categories}
            onChange={handleValueChange}
          />
        </Field>

        <Field>
          <Label>{i18n.sort}</Label>
          <InputNumber
            min={1}
            max={999}
            value={sort}
            style={{ width: '260px' }}
            onChange={(value) => handleValueChange('sort', value)}
          />
        </Field>

        {/* <Field>
          <Label>Popularity rank</Label>
          <p style={{ fontSize: '12px', color: '#f90' }}>
            {'(Rank >= 400 will be show in the popular component bar.)'}
          </p>
          <div style={{ display: 'flex' }}>
            <Slider
              min={1}
              max={999}
              value={rank}
              onChange={(value) => handleValueChange('rank', value)}
              style={{ flexGrow: 1 }}
            />
            <div style={{ width: 100, paddingTop: 6, paddingLeft: 8 }}>
              <FireFilled style={{ color: getRankColor(rank) }} /> ( {rank} )
            </div>
          </div>
        </Field> */}

        {/* <Field>
          <Label>Screenshots</Label>
          <TooltipContainer>
            (Only save one screenshot, after upload will cover the front.)
            <br />* Screenshots must be uploaded by the product manager before component has been used
          </TooltipContainer>
          <CoverUpload value={picture} onChange={(value) => updateData('picture', value)} />
        </Field> */}

        <Field>
          <Label>{i18n.description}</Label>
          <TooltipContainer>{i18n.descriptionTips}</TooltipContainer>
          <MdEditor
            style={{ height: '500px', overflow: 'hidden auto' }}
            value={description}
            renderHTML={(text) => mdParser.render(text)}
            onChange={handleEditorChange}
          />
        </Field>
      </Group>
    </div>
  );
}

export default BasicInfoPanel;

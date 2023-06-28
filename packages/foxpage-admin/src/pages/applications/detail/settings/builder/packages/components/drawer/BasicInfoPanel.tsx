import React, { useContext } from 'react';

import { Input, InputNumber, message, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import styled from 'styled-components';

import { Field, Group, Label, MarkdownCodeEditor } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { CategoryType, Component } from '@/types/index';
import { getImageUrlByEnv } from '@/utils/index';

// import { getRankColor } from '../rank';
import Category from './Category';

// import CoverUpload from './CoverUpload';
import 'react-markdown-editor-lite/lib/index.css';

const TooltipContainer = styled.p`
  color: #f90;
  font-size: 12px;
`;

const CoverBox = styled.div`
  position: relative;
  text-align: center;
  padding: 12px;
  border: 1px dashed #ddd;
  margin-top: 8px;
  .cover {
    width: 280px;
    height: 140px;
    margin: 0 auto;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

interface IProps {
  category?: Component['category'];
  categories: CategoryType[];
  onChange: (data: Component['category']) => void;
}

function BasicInfoPanel(props: IProps) {
  const { category, categories, onChange } = props;
  const { name, categoryName = '', groupName = '', sort, description, screenshot = '' } = category || {};

  // i18n
  const { locale } = useContext(GlobalContext);
  const { category: i18n, setting: settingI18n } = locale.business;

  const handleValueChange = (key, value) => {
    if (value && /{{+.+}}/.test(value)) {
      return;
    }
    onChange(Object.assign({}, category, { [key]: value }));
  };

  const handleEditorChange = (v: string) => {
    handleValueChange('description', v);
  };

  const beforeUpload = (file: RcFile) => {
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error(settingI18n.componentCoverSizeExceedError);
    }
    return isLt1M;
  };

  const getBase64File = (file: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(file);
  };

  const uploadBase64File = (file: RcFile) => {
    getBase64File(file, (base64) => {
      // TODO: do upload here
      return base64;
    });
  };

  return (
    <div>
      <Group>
        <Field>
          <Label>
            {i18n.label} <span style={{ color: 'red' }}>*</span>
          </Label>
          <Input value={name} maxLength={30} onChange={(e) => handleValueChange('name', e.target.value)} />
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

        <Field>
          <Label>{i18n.cover}</Label>
          <Input value={screenshot} onChange={(e) => handleValueChange('screenshot', e.target.value)} />
          <CoverBox>
            <Upload
              accept="image/*"
              maxCount={1}
              showUploadList={false}
              beforeUpload={beforeUpload}
              customRequest={(img) => uploadBase64File(img.file as RcFile)}>
              <div className="cover">
                <img src={screenshot || getImageUrlByEnv('/images/placeholder.png')} width="100%" />
              </div>
            </Upload>
          </CoverBox>
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
          <MarkdownCodeEditor value={description || ''} onChange={handleEditorChange} />
        </Field>
      </Group>
    </div>
  );
}

export default BasicInfoPanel;

import React from 'react';

import { InboxOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { useFoxpageContext } from '../context';

import { Iframe } from './Iframe';

interface IProps {
  pageContentEmpty: boolean;
  handleModalSelect: () => void;
}

const ModalSelector = styled.div`
  width: 400px;
  padding: 10px;
  border: 1px dashed #dddddd;
  background: #ffffff;
  font-size: 40px;
  color: #cac6c6;
  text-align: center;
  cursor: pointer;
  position: absolute;
  top: calc(50% - 55px);
  left: calc(50% - 200px);
  :hover {
    background: #f2f2f2;
  }
`;

export const MainView = ({ pageContentEmpty, handleModalSelect }: IProps) => {
  const { config, foxI18n, visualFrameSrc } = useFoxpageContext();

  const pageId = config.page?.id || '';
  if (!pageId) {
    return null;
  }

  if (pageId && pageContentEmpty) {
    return (
      <ModalSelector onClick={handleModalSelect}>
        <InboxOutlined />
        <div style={{ fontSize: 20 }}>{foxI18n.selectTemplateTips}</div>
      </ModalSelector>
    );
  }

  return <Iframe key={visualFrameSrc} pageId={pageId} width="100%" height="100%" />;
};

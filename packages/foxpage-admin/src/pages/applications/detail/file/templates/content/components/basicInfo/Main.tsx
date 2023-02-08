import React, { useContext } from 'react';

import { CalendarOutlined, CodeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import { GlobalContext } from '@/pages/system';
import { File } from '@/types/index';
import { periodFormat } from '@/utils/period-format';

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const Information = styled.div`
  flex: 1;
  padding-left: 16px;
`;

const Name = styled.h1`
  font-weight: bold;
  font-size: 20px;
  line-height: 1;
  margin-bottom: 8px;
`;

const Meta = styled.div`
  font-weight: normal;
  font-size: 14px;
  line-height: 24px;
  color: #707070;
  > span {
    margin-right: 30px;
    :last-child {
      margin-right: 0;
    }
  }
`;

const Text = styled.span`
  display: inline-block;
  margin-left: 4px;
`;

interface IProps {
  fileDetail: File;
}

const BasicInfo: React.FC<IProps> = (props) => {
  const { fileDetail } = props;
  const { createTime, creator, id, name } = fileDetail || {};

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file, global } = locale.business;

  return (
    <>
      {fileDetail && (
        <Container>
          <Avatar
            size={64}
            style={{
              display: 'inline-block',
              backgroundColor: '#2DB7F5',
            }}>
            {file.template}
          </Avatar>
          <Information>
            <Name>{name || '-'}</Name>
            <Meta>
              <Tooltip placement="top" title={file.id}>
                <CodeOutlined />
                <Text>{id || ''}</Text>
              </Tooltip>
              <Tooltip placement="top" title={global.creator}>
                <UserOutlined />
                <Text style={{ userSelect: 'none' }}>{creator?.account || ''}</Text>
              </Tooltip>
              <Tooltip placement="top" title={global.createTime}>
                <CalendarOutlined />
                <Text style={{ userSelect: 'none' }}>{periodFormat(createTime, 'unknown') || ''}</Text>
              </Tooltip>
              {fileDetail?.online && (
                <Tooltip placement="top" title={file.sellingStatus}>
                  <Tag color="#FF5500">{file.inStore}</Tag>
                </Tooltip>
              )}
            </Meta>
          </Information>
        </Container>
      )}
    </>
  );
};

export default BasicInfo;

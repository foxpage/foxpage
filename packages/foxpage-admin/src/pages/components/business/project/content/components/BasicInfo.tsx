import React, { useContext } from 'react';

import { CalendarOutlined, CodeOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Tooltip } from 'antd';
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
  const { createTime, creator, id, name, type } = fileDetail || {};

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file, global } = locale.business;

  const typeMap = {
    page: {
      name: file.page,
      bgColor: '#87D068',
    },
    template: {
      name: file.template,
      bgColor: '#2DB7F5',
    },
  };

  return (
    <>
      {fileDetail && (
        <Container>
          <Avatar
            size={64}
            style={{
              display: 'inline-block',
              backgroundColor: type ? typeMap[type].bgColor : 'transparent',
            }}>
            {type ? typeMap[type].name : ''}
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
                <Text>{creator?.account || ''}</Text>
              </Tooltip>
              <Tooltip placement="top" title={global.createTime}>
                <CalendarOutlined />
                <Text>{periodFormat(createTime, 'unknown') || ''}</Text>
              </Tooltip>
            </Meta>
          </Information>
        </Container>
      )}
    </>
  );
};

export default BasicInfo;

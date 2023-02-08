import React, { useContext, useEffect, useRef, useState } from 'react';

import { CalendarOutlined, CodeOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Input as AntInput, InputRef, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import { GlobalContext } from '@/pages/system';
import { File, ProjectEntity } from '@/types/index';
import { periodFormat } from '@/utils/index';

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const Information = styled.div`
  flex: 1;
  padding-left: 16px;
`;

const Name = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: 4px;
  font-size: 20px;
  font-weight: bold;
  line-height: 1;
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

const Input = styled(AntInput)`
  font-size: 20px;
  font-weight: bold;
  &.ant-input[disabled] {
    color: #000000;
    cursor: default;
  }
`;

interface IProps {
  env?: string;
  fileType: string;
  fileDetail?: File | ProjectEntity;
  onBlur?: (params: any, cb?: () => void) => void;
}

const BasicInfo: React.FC<IProps> = (props) => {
  const { fileDetail, fileType, onBlur } = props;
  const { createTime, creator, id, name: originName, type } = fileDetail || {};
  const [disabled, setDisabled] = useState(true);
  const [name, setName] = useState('');

  const inputRef = useRef<InputRef>(null);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file, global, project } = locale.business;

  const typeMap = {
    project: {
      name: global.project,
      bgColor: '#FF9900',
    },
    page: {
      name: file.page,
      bgColor: '#87D068',
    },
    template: {
      name: file.template,
      bgColor: '#2DB7F5',
    },
    block: {
      name: file.block,
      bgColor: '#108ee9',
    },
  };

  useEffect(() => {
    if (originName) setName(originName);
  }, [originName]);

  const handleEditClick = () => {
    setDisabled(false);

    // handle setting state and focus at the same time causes focus to not take effect
    setTimeout(() => {
      inputRef.current!.focus({
        cursor: 'end',
      });
    }, 150);
  };

  const handleOnBlur = () => {
    if (typeof onBlur === 'function' && name !== originName) {
      onBlur(name, () => setDisabled(true));
    } else {
      setDisabled(true);
    }
  };

  return (
    <>
      {fileDetail && (
        <Container>
          <Avatar
            size={64}
            style={{
              display: 'inline-block',
              backgroundColor: type ? typeMap[type]?.bgColor : '#FF9900',
            }}>
            {type ? typeMap[type]?.name : global.project}
          </Avatar>
          <Information>
            <Name>
              <Button type="text" onClick={handleEditClick} style={{ padding: 0, marginRight: 4 }}>
                <EditOutlined />
              </Button>
              <Input
                size="small"
                disabled={disabled}
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleOnBlur}
                onPressEnter={handleOnBlur}
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: disabled ? 'transparent' : '#40a9ff',
                  fontSize: 20,
                  fontWeight: 'bold',
                }}
              />
            </Name>
            <Meta>
              <Tooltip placement="top" title={fileType === 'project' ? project.id : file.id}>
                <CodeOutlined />
                <Text>{id || '-'}</Text>
              </Tooltip>
              <Tooltip placement="top" title={global.creator}>
                <UserOutlined />
                <Text style={{ userSelect: 'none' }}>{creator?.account || '-'}</Text>
              </Tooltip>
              <Tooltip placement="top" title={global.createTime}>
                <CalendarOutlined />
                <Text style={{ userSelect: 'none' }}>
                  {createTime ? periodFormat(createTime, 'unknown') : '-'}
                </Text>
              </Tooltip>
              {(fileDetail as File)?.online && (
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

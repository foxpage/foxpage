import React, { useContext, useEffect, useMemo, useState } from 'react';

import { CalendarOutlined, CodeOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Input as AntInput, Tooltip } from 'antd';
import styled from 'styled-components';

import { GlobalContext } from '@/pages/system';
import { File, ProjectEntity, ProjectSaveParams } from '@/types/index';
import { getLoginUser, periodFormat } from '@/utils/index';

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
  margin-bottom: 8px;
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

const Editor = styled.span`
  font-size: 16px;
  font-weight: normal;
  margin-right: 4px;
  &:hover {
    cursor: pointer;
  }
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
  saveProject?: (params: ProjectSaveParams, cb?: () => void) => void;
  updateFolderName?: (name: string) => void;
}

const BasicInfo: React.FC<IProps> = (props) => {
  const { env, fileDetail, fileType, saveProject, updateFolderName } = props;
  const { createTime, creator, id, name, type } = fileDetail || {};
  const [disabled, setDisabled] = useState(true);
  const [projectName, setProjectName] = useState('');

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file, global, project } = locale.business;

  // auth check
  const { userInfo } = getLoginUser();

  const typeMap = {
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
    if (name) setProjectName(name);
  }, [name]);

  const authCheck = useMemo(() => {
    return (
      fileType === 'project' && (env === 'personal' || env === 'application' || creator?.id === userInfo?.id)
    );
  }, [creator, env, fileType, userInfo?.id]);

  const handleSaveFolder = () => {
    if (typeof saveProject === 'function' && projectName !== name) {
      saveProject(
        {
          applicationId: fileDetail?.application?.id || '',
          editProject: {
            id: fileDetail?.id || '',
            application: {
              id: fileDetail?.application?.id || '',
              name: fileDetail?.application?.name || '',
            },
            name: projectName,
          },
        },
        () => {
          setDisabled(true);

          if (typeof updateFolderName === 'function') updateFolderName(projectName);
        },
      );
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
              {authCheck ? (
                <>
                  <Editor onClick={() => setDisabled(false)}>
                    <EditOutlined />
                  </Editor>
                  <Input
                    bordered={!disabled}
                    disabled={disabled}
                    size="small"
                    value={projectName}
                    onBlur={handleSaveFolder}
                    onChange={(e) => setProjectName(e.target.value)}
                    style={{ fontSize: 20, fontWeight: 'bold' }}
                  />
                </>
              ) : (
                name || '-'
              )}
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
                <Text style={{ userSelect: 'none' }}>{periodFormat(createTime, 'unknown') || '-'}</Text>
              </Tooltip>
            </Meta>
          </Information>
        </Container>
      )}
    </>
  );
};

export default BasicInfo;

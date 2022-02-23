import React, { useContext, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Empty, Modal, Row, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { FileTagType } from '@/constants/file';
import { FoxpageBreadcrumb } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';
import * as ACTIONS from '@/store/actions/group/application/resource/groups';
import { ResourceGroup } from '@/types/application';
import { ApplicationUrlParams } from '@/types/index';

import EditDrawer from './EditDrawer';

const OptionsBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const GroupsBox = styled.div``;

const LoadingBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  width: 100%;
`;

const GroupCard = styled(Card)`
  position: relative;
  display: inline-block;
  width: 100%;
  text-align: center;
  :hover .foxpage-group-card-operate {
    display: block;
  }
  .ant-card-body {
    display: flex;
    height: 160px;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
`;

const OperateGroup = styled.div`
  position: absolute;
  display: none;
  bottom: 10px;
  right: 10px;
  :hover {
    color: #ff4d4f;
    border-color: #ff4d4f;
  }
`;

const ColAutoSpan = {
  span: 8,
  sx: 24,
  sm: 24,
  md: 12,
  lg: 8,
  xl: 6,
};

const mapStateToProps = (store: RootState) => ({
  groupList: store.group.application.resource.groups.groupList,
  loading: store.group.application.resource.groups.loading,
  application: store.group.application.settings.application,
});

const mapDispatchToProps = {
  dispatchFetchGroups: ACTIONS.fetchResourcesGroupsAction,
  dispatchOpenAddGroupDrawer: () => ACTIONS.updateResourcesEditDrawerState({ drawerOpen: true }),
  deleteGroup: ACTIONS.deleteResourcesGroupAction,
  editGroup: (group: ResourceGroup) => ACTIONS.updateResourcesEditDrawerState({ drawerOpen: true, group }),
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ResourceGroups: React.FC<ComponentsProps> = ({
  groupList = [],
  loading = false,
  application,
  dispatchFetchGroups,
  dispatchOpenAddGroupDrawer,
  deleteGroup,
  editGroup,
}) => {
  const isInit = useRef(false);
  const { applicationId, organizationId } = useParams<ApplicationUrlParams>();
  const { locale } = useContext(GlobalContext);
  const { global, resource, application: applicationI18n } = locale.business;
  useEffect(() => {
    dispatchFetchGroups({
      appId: applicationId,
    });
    isInit.current = true;
  }, []);
  const addGroup = () => {
    dispatchOpenAddGroupDrawer();
  };
  const onDeleteGroup = (id: string) => {
    Modal.confirm({
      title: resource.deleteTitle,
      content: resource.deleteMsg,
      okText: global.yes,
      okType: 'danger',
      cancelText: global.no,
      onOk() {
        deleteGroup({
          appId: applicationId,
          id,
        });
      },
    });
  };

  return (
    <div>
      <FoxpageBreadcrumb
        breadCrumb={[
          { name: applicationI18n.applicationList, link: `/#/organization/${organizationId}/application/list` },
          { name: resource.resourceGroup },
        ]}
      />
      <OptionsBox>
        <Button type="primary" onClick={addGroup}>
          <PlusOutlined /> {resource.addResourceGroup}
        </Button>
      </OptionsBox>
      <GroupsBox>
        {loading || !isInit.current ? (
          <LoadingBox>
            <Spin size="large" />
          </LoadingBox>
        ) : groupList && groupList.length > 0 ? (
          <Row gutter={[16, 16]}>
            {groupList.map(group => {
              const resourceId = group.tags?.find?.(item => item.type === FileTagType.ResourceGroup)?.resourceId;
              const resource = application?.resources?.find(item => item.id === resourceId);
              const ribbonText = resource?.name;
              return (
                <Col {...ColAutoSpan} key={group.id}>
                  <Link
                    to={`/organization/${organizationId}/application/${applicationId}/detail/resource/${group.folderPath}`}
                  >
                    <Badge.Ribbon text={ribbonText || 'No Type'} color={ribbonText ? '' : 'red'}>
                      <GroupCard hoverable>
                        <OperateGroup className="foxpage-group-card-operate">
                          <Button
                            type="default"
                            size="small"
                            shape="circle"
                            icon={<EditOutlined />}
                            style={{ marginRight: 4 }}
                            onClick={e => {
                              e.stopPropagation();
                              e.preventDefault();
                              editGroup(group);
                            }}
                          />
                          <Button
                            type="default"
                            size="small"
                            shape="circle"
                            icon={<DeleteOutlined />}
                            onClick={e => {
                              e.stopPropagation();
                              e.preventDefault();
                              onDeleteGroup(group.id);
                            }}
                          />
                        </OperateGroup>
                        <div>{group.name}</div>
                      </GroupCard>
                    </Badge.Ribbon>
                  </Link>
                </Col>
              );
            })}
          </Row>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </GroupsBox>
      <EditDrawer />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourceGroups);

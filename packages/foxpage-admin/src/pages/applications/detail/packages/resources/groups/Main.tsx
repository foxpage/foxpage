import React, { useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Empty, Modal, Row, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/resources/groups';
import { FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { ResourceTagEnum } from '@/constants/file';
import { GlobalContext } from '@/pages/system';

import EditDrawer from './components/EditDrawer';

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
  background-color: #fafafa;
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
  storeApplicationId: store.applications.detail.settings.app.applicationId,
  loading: store.applications.detail.resources.groups.loading,
  groupList: store.applications.detail.resources.groups.groupList,
});

const mapDispatchToProps = {
  fetchGroups: ACTIONS.fetchResourcesGroups,
  openDrawer: ACTIONS.openEditDrawer,
  deleteGroup: ACTIONS.deleteResourcesGroup,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ResourceGroups: React.FC<ComponentsProps> = (props) => {
  const { storeApplicationId, loading, groupList, fetchGroups, openDrawer, deleteGroup } = props;
  const [applicationId, setApplicationId] = useState<string | undefined>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, resource } = locale.business;

  const isInit = useRef(false);

  useEffect(() => {
    if (storeApplicationId) setApplicationId(storeApplicationId);
  }, [storeApplicationId]);

  useEffect(() => {
    if (applicationId) {
      fetchGroups({
        applicationId,
      });
      isInit.current = true;
    }
  }, [applicationId]);

  const onDeleteGroup = (id: string) => {
    Modal.confirm({
      title: resource.deleteTitle,
      content: resource.deleteMsg,
      okText: global.yes,
      okType: 'danger',
      cancelText: global.no,
      onOk() {
        if (applicationId)
          deleteGroup({
            applicationId,
            id,
            status: true,
          });
      },
    });
  };

  return (
    <>
      <FoxPageContent breadcrumb={<FoxPageBreadcrumb breadCrumb={[{ name: resource.resourceGroup }]} />}>
        <>
          <OptionsBox>
            <Button type="primary" onClick={() => openDrawer(true)}>
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
                {groupList.map((group) => {
                  const resourceDetail = group.tags?.find?.(
                    (item) => item.type === ResourceTagEnum.ResourceGroup,
                  );
                  const ribbonText = resourceDetail?.origin;

                  return (
                    <Col {...ColAutoSpan} key={group.id}>
                      <Link
                        to={`/applications/${applicationId}/package/resources/detail/${group.folderPath}`}>
                        <Badge.Ribbon text={ribbonText || 'No Type'} color={ribbonText ? '' : 'red'}>
                          <GroupCard hoverable>
                            <OperateGroup className="foxpage-group-card-operate">
                              <Button
                                type="default"
                                size="small"
                                shape="circle"
                                icon={<EditOutlined />}
                                style={{ marginRight: 4 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  openDrawer(true, group);
                                }}
                              />
                              <Button
                                type="default"
                                size="small"
                                shape="circle"
                                icon={<DeleteOutlined />}
                                onClick={(e) => {
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
        </>
      </FoxPageContent>
      <EditDrawer />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ResourceGroups);

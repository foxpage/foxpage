import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import { RootState } from 'typesafe-actions';

import { setAddDrawerOpenStatus } from '@/actions/group/project/list';
import * as ACTIONS from '@/actions/workspace/projects';
import EditDrawer from '@/pages/group/project/drawer/EditDrawer';
import { OrganizationUrlParams } from '@/types/index';
import getImageUrlByEnv from '@/utils/get-image-url-by-env';
import { setProjectFolder } from '@/utils/project/file';

const { Meta } = Card;

const mapStateToProps = (store: RootState) => ({
  loading: store.workspace.projects.loading,
  pageInfo: store.workspace.projects.pageInfo,
  projects: store.workspace.projects.projects,
});

const mapDispatchToProps = {
  openDrawer: setAddDrawerOpenStatus,
  searchMyProjects: ACTIONS.searchMyProjects,
  clearAll: ACTIONS.clearAll,
};

type ProjectsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Projects: React.FC<ProjectsProps> = props => {
  const { loading, pageInfo, projects, searchMyProjects, clearAll, openDrawer } = props;

  const { organizationId } = useParams<OrganizationUrlParams>();

  const history = useHistory();

  useEffect(() => {
    searchMyProjects({ page: pageInfo.page, size: pageInfo.size, search: '' });
    return () => {
      clearAll();
    };
  }, []);

  const handleSaveSuccess = () => {
    searchMyProjects({ page: pageInfo.page, size: pageInfo.size, search: '' });
  };

  return (
    <React.Fragment>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" onClick={openDrawer}>
          <PlusOutlined /> Add Project
        </Button>
      </div>
      <Row gutter={16} style={{ minHeight: 24, paddingBottom: 24, maxWidth: 1136, margin: '0 auto' }}>
        {projects.map(project => {
          return (
            <Col span={6} key={project.id}>
              <Card
                key={project.id}
                onClick={() => {
                  setProjectFolder(project);
                  history.push(
                    `/organization/${organizationId}/projects/${project.application.id}/folder/${project.id}?from=workspace`,
                  );
                }}
                cover={<img alt="example" src={getImageUrlByEnv('/images/placeholder.png')} />}
                style={{ marginBottom: 12 }}
                hoverable
                bordered
              >
                <Meta title={project.name} description={`Application: ${project.application.name}`} />
              </Card>
            </Col>
          );
        })}
        {!loading && projects?.length === 0 && (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '48px auto' }} />
        )}
        {loading && (
          <Spin
            style={{
              padding: 48,
              position: 'absolute',
              left: '50%',
            }}
            spinning={true}
          />
        )}
      </Row>
      <Pagination
        style={{ textAlign: 'center' }}
        current={pageInfo.page}
        total={pageInfo.total}
        pageSize={pageInfo.size}
        hideOnSinglePage
        onChange={(page, pageSize) => {
          searchMyProjects({ page, size: pageSize, search: '' });
        }}
      />
      <EditDrawer onSaveSuccess={handleSaveSuccess} />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Projects);

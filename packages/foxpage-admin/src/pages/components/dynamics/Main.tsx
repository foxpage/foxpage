import React, { useContext, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Pagination, Spin, Tag, Timeline } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/dynamics/index';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import {
  dynamicColor,
  DynamicOperationEnum,
  DynamicOperationTargetEnum,
  WIDTH_DEFAULT,
} from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { DynamicCategory, DynamicEntity } from '@/types/index';
import { periodFormat } from '@/utils/index';

const mapStateToProps = (store: RootState) => ({
  loading: store.workspace.dynamics.loading,
  pageInfo: store.workspace.dynamics.pageInfo,
  dynamics: store.workspace.dynamics.dynamics,
});

const mapDispatchToProps = {
  searchDynamics: ACTIONS.fetchDynamics,
  clearAll: ACTIONS.clearAll,
};

type DynamicProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    applicationId?: string;
  };

const Dynamics: React.FC<DynamicProps> = (props) => {
  const { applicationId, loading, pageInfo, dynamics, clearAll, searchDynamics } = props;

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { global } = locale.business;

  useEffect(() => {
    searchDynamics({
      organizationId,
      page: pageInfo.page,
      size: pageInfo.size,
      search: '',
      ...(applicationId ? { applicationId, type: 'application' } : {}),
    });

    return () => {
      clearAll();
    };
  }, [applicationId]);

  return (
    <Content>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              {
                name: global.dynamics,
              },
            ]}
          />
        }>
        <Spin spinning={loading}>
          <Content style={{ maxWidth: WIDTH_DEFAULT }}>
            <Timeline>
              {dynamics.map((dynamic: DynamicEntity) => {
                console.log(dynamic, '???');
                const { creator, actionType, category } = dynamic;
                const { applicationName } = category;
                const [operation, target, contentType] = actionType.split('_');
                const targetContent = DynamicOperationTargetEnum[target];
                return (
                  <Timeline.Item key={dynamic.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="text-grey-100">{periodFormat(dynamic.createTime, 'unknown')}</div>
                        <div className="flex mt-2">
                          {creator ? <div>{creator.nickName}</div> : '-'}
                          <div>
                            <Tag color={dynamicColor[DynamicOperationEnum[operation] || 'default']}>
                              {global[DynamicOperationEnum[operation]]}
                            </Tag>
                            <DynamicsComponentLink
                              category={category}
                              target={DynamicOperationTargetEnum[target]}
                              displayedName={`${global[targetContent] || targetContent || '-'} ${
                                global[contentType] || contentType || ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      <div>{applicationName && <div>{`${applicationName} ${global.application}`}</div>}</div>
                    </div>
                  </Timeline.Item>
                );
              })}
            </Timeline>
            <Pagination
              style={{ textAlign: 'center' }}
              current={pageInfo.page}
              total={pageInfo.total}
              pageSize={pageInfo.size}
              hideOnSinglePage
              onChange={(page, pageSize) => {
                searchDynamics({
                  organizationId,
                  page,
                  size: pageSize,
                  search: '',
                  ...(applicationId ? { applicationId, type: 'application' } : {}),
                });
              }}
            />
          </Content>
        </Spin>
      </FoxPageContent>
    </Content>
  );
};

const DynamicsComponentLink = ({
  category,
  target,
  displayedName,
}: {
  category: DynamicCategory;
  target: DynamicOperationTargetEnum;
  displayedName?: string;
}) => {
  const linkAddress = useMemo(() => {
    switch (target) {
      case 'application':
        return `/applications/${category.applicationId}/projects/list`;
      case 'project':
      case 'folder':
        return `/applications/${category.applicationId}/projects/detail/?applicationId=${category.applicationId}&folderId=${category.folderId}`;
      case 'page':
      case 'template':
      case 'block':
        return `/applications/${category.applicationId}/projects/content/content?applicationId=${category.applicationId}&fileId=${category.fileId}`;
      case 'content':
        return `/builder?applicationId=${category.applicationId}&folderId=${category.folderId}&fileId=${category.fileId}&contentId=${category.contentId}`;
      case 'function':
        return `/applications/${category.applicationId}/file/functions`;
      case 'variable':
        return `/applications/${category.applicationId}/file/variables`;
      case 'condition':
        return `/applications/${category.applicationId}/file/conditions`;
      default:
        return '';
    }
  }, [category, target]);
  return linkAddress ? <Link to={linkAddress}>{displayedName}</Link> : <>{displayedName}</>;
};

export default connect(mapStateToProps, mapDispatchToProps)(Dynamics);

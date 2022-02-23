import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { SearchOutlined, SwapRightOutlined } from '@ant-design/icons';
import { Button, Col, message, Row, Select, Spin, TreeSelect } from 'antd';
import _ from 'lodash';
import { RootState } from 'typesafe-actions';

import OperationDrawer from '@/components/business/OperationDrawer';
import { Group, Title } from '@/components/widgets';
import { FileTagType } from '@/constants/file';
import GlobalContext from '@/pages/GlobalContext';
import * as ACTIONS from '@/store/actions/group/application/packages/detail';
import { fetchResourcesGroupsAction } from '@/store/actions/group/application/resource/groups';
import { ComponentRemote, FileUrlParams } from '@/types/application';

import './style.css';

const { Option } = Select;
const { TreeNode } = TreeSelect;

const mapStateToProps = (store: RootState) => ({
  open: store.group.application.packages.detail.cloudSyncDrawer.open,
  componentRemote: store.group.application.packages.detail.cloudSyncDrawer.componentRemote,
  lastVersion: store.group.application.packages.detail.cloudSyncDrawer.lastVersion,
  loading: store.group.application.packages.detail.cloudSyncDrawer.loading,
  groupList: store.group.application.resource.groups.groupList,
  groupLoading: store.group.application.resource.groups.loading,
  componentInfo: store.group.application.packages.detail.componentInfo,
  versions: store.group.application.packages.detail.versionList.versions,
  fileDetail: store.group.application.packages.detail.fileDetail,
});

const mapDispatchToProps = {
  closeDrawer: () => ACTIONS.updateCloudSyncDrawerOpenStatus(false),
  fetchGroups: fetchResourcesGroupsAction,
  fetchComponentRemotes: ACTIONS.fetchComponentRemotes,
  saveComponentRemote: ACTIONS.saveComponentRemote,
  fetchFileDetail: ACTIONS.fetchFileDetail,
};

type CloudSyncDrawerProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ComponentCloudSyncDrawer: React.FC<CloudSyncDrawerProps> = props => {
  const {
    open,
    loading,
    groupLoading,
    groupList,
    componentInfo,
    componentRemote,
    fileDetail,
    lastVersion,
    fetchGroups,
    fetchComponentRemotes,
    closeDrawer,
    saveComponentRemote,
    fetchFileDetail,
  } = props;
  const { applicationId, fileId } = useParams<FileUrlParams>();
  const [groupId, setGroupId] = useState<string>('');
  const [mappingRelation, setMappingRelation] = useState<Record<string, string>>({});
  const { locale } = useContext(GlobalContext);
  const { global, version: versionI18n, resource } = locale.business;

  useEffect(() => {
    if (open) {
      fetchGroups({
        appId: applicationId,
      });
      fetchFileDetail({ applicationId, ids: [fileId] });
    }
  }, [open]);

  useEffect(() => {
    const newGroupId =
      fileDetail?.tags?.find(item => item.type === FileTagType.ResourceGroup && item.resourceGroupId)
        ?.resourceGroupId || '';
    setGroupId(newGroupId);
    if (newGroupId && open) {
      handleSearch(newGroupId);
    }
  }, [fileDetail?.tags, open]);

  useEffect(() => {
    if (componentRemote?.component) {
      const {
        content: {
          resource: {
            entry: { node, css, browser, debug },
          },
        },
      } = componentRemote.component;

      setMappingRelation({
        node: getShortPath(node?.path),
        browser: getShortPath(browser?.path),
        debug: getShortPath(debug?.path),
        css: getShortPath(css?.path),
      });
    }
  }, [componentRemote]);

  const handleSave = () => {
    if (componentRemote) {
      const savedComponent = _.cloneDeep<ComponentRemote>(componentRemote);

      const {
        component: {
          content: {
            resource: { entry },
          },
        },
        resource: { groupName, version, resourceName },
      } = savedComponent;
      const prefix = `${groupName}/${resourceName}/${version}/`;
      if (mappingRelation.browser) {
        entry.browser = { contentId: '', path: prefix + mappingRelation.browser };
      }
      if (mappingRelation.debug) {
        entry.debug = { contentId: '', path: prefix + mappingRelation.debug };
      }
      if (mappingRelation.node) {
        entry.node = { contentId: '', path: prefix + mappingRelation.node };
      }
      if (mappingRelation.css) {
        entry.css = { contentId: '', path: prefix + mappingRelation.css };
      }

      saveComponentRemote({
        applicationId,
        components: [savedComponent],
      });
    }
  };

  const handleSearch = (groupId: string) => {
    if (!groupId) {
      message.warning(resource.groupError);
      return;
    }
    fetchComponentRemotes({
      applicationId,
      groupId,
      id: componentInfo.fileId,
      name: componentInfo.title,
    });
  };

  const handleUpdateComponent = (key: string, value: string) => {
    const newMapping = Object.assign({}, mappingRelation);
    newMapping[key] = value;
    setMappingRelation(newMapping);
  };

  const getShortPath = (path?: string) => {
    if (!path) {
      return '';
    }
    const array = path.split('/');
    return array.splice(array.length - 2, array.length).join('/');
  };

  const treeNode = useMemo(() => {
    if (!componentRemote) {
      return null;
    }
    const {
      resource: { files },
    } = componentRemote;

    return (
      <>
        {Object.entries(files).map(([key, value]) => {
          const isLeaf = !_.isObject(value);
          return (
            <TreeNode key={key} value={key} title={key} isLeaf={isLeaf} selectable={isLeaf}>
              {!isLeaf &&
                Object.keys(value).map(subKey => {
                  return <TreeNode key={subKey} value={`${key}/${subKey}`} title={subKey} isLeaf />;
                })}
            </TreeNode>
          );
        })}
      </>
    );
  }, [componentRemote]);

  const treeSelectProps = {
    style: { width: '100%' },
    dropdownStyle: { maxHeight: 400, overflow: 'auto' },
    treeDefaultExpandAll: true,
    allowClear: true,
  };

  const componentRemoteNode = useMemo(() => {
    if (!componentRemote) {
      return null;
    }
    const {
      resource: { files, latestVersion, version, resourceName },
      component: { version: componentNewVersion },
    } = componentRemote;

    return (
      <Group>
        <Title>Manifest</Title>
        <table className="source-diff-table">
          <tbody>
            <tr>
              <td>{versionI18n.componentVersion}</td>
              <td className="after">{version}</td>
            </tr>
            <tr>
              <td>{resource.resourceVersion}</td>
              <td className="after">{resourceName}</td>
            </tr>
            {Object.entries(files).map(([key, value]) => {
              if (_.isObject(value)) {
                return Object.entries(value)
                  .map(([subKey, subValue]) => {
                    return (
                      <tr key={subKey}>
                        <td>
                          {key}/{subKey}
                        </td>
                        <td className="after">{subValue}</td>
                      </tr>
                    );
                  })
                  .flat();
              } else {
                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td className="after">{value}</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
        <Title>{resource.resourceVersion}</Title>
        <table className="source-diff-table">
          <tbody>
            <tr>
              <td className="before">{latestVersion || '-'}</td>
              <td style={{ textAlign: 'center' }}>
                <SwapRightOutlined />
              </td>
              <td className="after">{version}</td>
            </tr>
          </tbody>
        </table>
        <Title>{versionI18n.componentVersion}</Title>
        <table className="source-diff-table">
          <tbody>
            <tr>
              <td className="before">{lastVersion?.version || '-'}</td>
              <td style={{ textAlign: 'center' }}>
                <SwapRightOutlined />
              </td>
              <td className="after">{componentNewVersion}</td>
            </tr>
          </tbody>
        </table>
        <Title>Mapping</Title>
        <table className="source-diff-table">
          <tbody>
            <tr>
              <td>Node</td>
              <td className="after" width="70%">
                <TreeSelect
                  {...treeSelectProps}
                  value={mappingRelation.node}
                  onChange={value => {
                    handleUpdateComponent('node', value);
                  }}
                >
                  {treeNode}
                </TreeSelect>
              </td>
            </tr>

            <tr>
              <td>Browser</td>
              <td className="after" width="70%">
                <TreeSelect
                  {...treeSelectProps}
                  value={mappingRelation.browser}
                  onChange={value => {
                    handleUpdateComponent('browser', value);
                  }}
                >
                  {treeNode}
                </TreeSelect>
              </td>
            </tr>

            <tr>
              <td>Debug</td>
              <td className="after" width="70%">
                <TreeSelect
                  {...treeSelectProps}
                  value={mappingRelation.debug}
                  onChange={value => {
                    handleUpdateComponent('debug', value);
                  }}
                >
                  {treeNode}
                </TreeSelect>
              </td>
            </tr>

            <tr>
              <td>Css</td>
              <td className="after" width="70%">
                <TreeSelect
                  {...treeSelectProps}
                  value={mappingRelation.css}
                  onChange={value => {
                    handleUpdateComponent('css', value);
                  }}
                >
                  {treeNode}
                </TreeSelect>
              </td>
            </tr>
          </tbody>
        </table>
      </Group>
    );
  }, [componentRemote, treeNode, mappingRelation]);

  return (
    <OperationDrawer
      open={open}
      title={versionI18n.syncTitle}
      onClose={closeDrawer}
      width={700}
      destroyOnClose
      actions={
        <Button type="primary" onClick={handleSave}>
          {global.apply}
        </Button>
      }
    >
      <>
        <Spin spinning={groupLoading}>
          <Group>
            <Row>
              <Col span={2} offset={2} style={{ paddingTop: 5 }}>
                <Title>{resource.group}:</Title>
              </Col>
              <Col span={12}>
                <Select
                  placeholder={resource.group}
                  value={groupId}
                  style={{ width: '100%' }}
                  onChange={(value: string) => {
                    setGroupId(value);
                  }}
                >
                  {groupList?.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={6}>
                <Button
                  type="default"
                  onClick={() => {
                    handleSearch(groupId);
                  }}
                  style={{ marginLeft: 12 }}
                >
                  <SearchOutlined /> {global.search}
                </Button>
              </Col>
            </Row>
          </Group>
        </Spin>
        <Spin spinning={loading} style={{ minHeight: 100 }}>
          {componentRemoteNode}
        </Spin>
      </>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ComponentCloudSyncDrawer);

import React, { useContext, useEffect, useMemo, useState } from 'react';

import { SwapRightOutlined } from '@ant-design/icons';
import { Select, TreeSelect } from 'antd';
import _ from 'lodash';

import { Group, Title } from '@/components/widgets';
import { ComponentType } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ComponentEditVersionEntity, ComponentRemote } from '@/types/index';

import '../style.css';

const { TreeNode } = TreeSelect;
const { Option } = Select;

interface IProps {
  componentRemote?: ComponentRemote;
  lastVersion?: ComponentEditVersionEntity;
  onChange?: (value: Record<string, string>) => void;
  updateComponentRemoteInfo?: (name: string, info: Partial<ComponentRemote>) => void;
  componentType?: string;
}

export const ComponentResource: React.FC<IProps> = (props) => {
  const { componentRemote, lastVersion, onChange, updateComponentRemoteInfo, componentType } = props;
  const [mappingRelation, setMappingRelation] = useState<Record<string, string>>({});

  // i18n
  const { locale } = useContext(GlobalContext);
  const { version: versionI18n, resource } = locale.business;

  useEffect(() => {
    if (componentRemote?.component) {
      const {
        content: {
          resource: {
            entry: { node, css, browser, debug, editor },
          },
        },
      } = componentRemote.component;

      setMappingRelation({
        node: getShortPath(node?.path),
        browser: getShortPath(browser?.path),
        debug: getShortPath(debug?.path),
        css: getShortPath(css?.path),
        editor: getShortPath(editor?.path),
      });
    }
  }, [componentRemote]);

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange(mappingRelation);
    }
  }, [mappingRelation]);

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
            <TreeNode key={`${key}`} value={key} title={key} isLeaf={isLeaf} selectable={isLeaf}>
              {!isLeaf &&
                Object.keys(value).map((subKey) => {
                  return (
                    <TreeNode key={`${key}/${subKey}`} value={`${key}/${subKey}`} title={subKey} isLeaf />
                  );
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
      resource: { files, latestVersion, version, resourceName, name: componentName },
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
        <Title>{versionI18n.componentType}</Title>
        <table className="source-diff-table">
          <tbody>
            <tr>
              <td className="after">componentType</td>
              <td className="after" width="70%">
                {componentType ? (
                  <Select defaultValue={componentType} disabled style={{ width: '100%' }}>
                    <Option value={componentType}>{componentType}</Option>
                  </Select>
                ) : (
                  <Select
                    defaultValue={ComponentType.reactComponent}
                    onChange={(value) =>
                      updateComponentRemoteInfo &&
                      updateComponentRemoteInfo(componentName, { componentType: value })
                    }
                    style={{ width: '100%' }}>
                    <Option value={ComponentType.reactComponent}>{ComponentType.reactComponent}</Option>
                    <Option value={ComponentType.dslTemplate}>{ComponentType.dslTemplate}</Option>
                  </Select>
                )}
              </td>
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
                  onChange={(value) => {
                    handleUpdateComponent('node', value);
                  }}>
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
                  onChange={(value) => {
                    handleUpdateComponent('browser', value);
                  }}>
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
                  onChange={(value) => {
                    handleUpdateComponent('debug', value);
                  }}>
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
                  onChange={(value) => {
                    handleUpdateComponent('css', value);
                  }}>
                  {treeNode}
                </TreeSelect>
              </td>
            </tr>

            <tr>
              <td>Editor</td>
              <td className="after" width="70%">
                <TreeSelect
                  {...treeSelectProps}
                  value={mappingRelation.editor}
                  onChange={(value) => {
                    handleUpdateComponent('editor', value);
                  }}>
                  {treeNode}
                </TreeSelect>
              </td>
            </tr>
          </tbody>
        </table>
      </Group>
    );
  }, [componentRemote, treeNode, mappingRelation]);

  return componentRemoteNode;
};

export default ComponentResource;

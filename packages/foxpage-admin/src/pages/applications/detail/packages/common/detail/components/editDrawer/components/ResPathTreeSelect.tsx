import React, { useEffect, useState } from 'react';

import { TreeSelect } from 'antd';

import { getResourcesByPathsWithCache, getResourcesGroupSearchsWithCache } from '@/apis/application';

interface TreeNodeType {
  id: string;
  parentId?: string;
  value: string;
  title: string;
  isLeaf: boolean;
}

interface ResPathTreeSelectProps {
  applicationId: string;
  disabled?: boolean;
  value?: {
    label: string;
    value: string;
  };
  onChange?(value: { value: string; label: string }): void;
}

const ResPathTreeSelect: React.FC<ResPathTreeSelectProps> = (props) => {
  const { applicationId, value, disabled, onChange } = props;
  const [treeData, setTreeData] = useState<TreeNodeType[]>([]);
  const [treeValue, setTreeValue] = useState<{ value: string; label: string } | undefined>(value);

  useEffect(() => {
    (async () => {
      if (!applicationId) {
        console.warn('applicationId is empty! can\'t init resource path tree select');
        return;
      }
      const nodeList = await getResourcesGroupSearchsWithCache({
        applicationId,
      }).then((list = []) => {
        return list.map(({ id, name, folderPath }) => ({
          id: id,
          pId: undefined,
          value: id,
          title: name,
          path: folderPath,
          isLeaf: false,
          selectable: false,
        }));
      });
      setTreeData(nodeList);
    })();
  }, [applicationId]);

  useEffect(() => {
    if (value && treeValue?.value !== value?.value) {
      if (treeData.find((data) => data.value === value.value)) {
        setTreeValue(value);
      } else {
        setTreeValue({ ...value, value: value.label });
      }
    }
  }, [value, treeData]);

  const handleChange = (selectValue: { value: string; label: string }) => {
    setTreeValue(selectValue);
    if (typeof onChange === 'function') onChange(selectValue);
  };

  const onLoadData = (dataNode: any) => {
    const { id: pId, path } = dataNode;

    return getResourcesByPathsWithCache({
      applicationId,
      path,
    }).then((data) => {
      const { children } = data;
      const { folders = [], files = [] } = children || {};
      const res = [
        ...folders.map(({ id, name, folderPath }) => ({
          id: id,
          pId,
          value: id,
          title: name,
          path: `${path}/${folderPath}`,
          isLeaf: false,
          selectable: false,
        })),
        ...files.map(({ contentId, name }) => ({
          id: contentId,
          pId,
          value: contentId,
          title: name,
          path: `${path}/${name}`,
          isLeaf: true,
          selectable: true,
        })),
      ];
      setTreeData((_treeData) => _treeData.concat(res));
    });
  };

  return (
    <TreeSelect
      treeDataSimpleMode
      labelInValue
      allowClear
      disabled={disabled}
      style={{ width: '100%' }}
      value={treeValue}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      placeholder="Please select"
      onChange={handleChange}
      loadData={onLoadData}
      treeData={treeData}
      treeNodeLabelProp="path"
    />
  );
};

export default ResPathTreeSelect;

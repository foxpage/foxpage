import React from 'react';
import { connect } from 'react-redux';

import { Table, Tag, Typography } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import { suffixTagColor } from '@/pages/common/constant/FileType';
import periodFormat from '@/utils/period-format';

const { Paragraph } = Typography;

const mapStateToProps = (store: RootState) => ({
  loading: store.store.list.loading,
  previewModalVisible: store.store.list.previewModalVisible,
  selectedItem: store.store.list.selectedItem,
});

const mapDispatchToProps = {
  updatePreviewModalVisible: ACTIONS.updatePreviewModalVisible,
};

type BasicInfoProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const BasicInfo: React.FC<BasicInfoProps> = props => {
  const { selectedItem } = props;
  if (!selectedItem) {
    return null;
  }
  return (
    <div>
      <Paragraph>Name: {selectedItem.name}</Paragraph>
      <Paragraph>Creator: {selectedItem.creator?.account}</Paragraph>
      <Paragraph>Application: {selectedItem.application?.name}</Paragraph>
      <Paragraph>Create Time: {periodFormat(selectedItem?.createTime, 'unknown')}</Paragraph>
      <Paragraph>
        File:
        <Table
          size="small"
          columns={[
            {
              title: 'Id',
              dataIndex: 'id',
            },
            {
              title: 'Name',
              dataIndex: 'name',
            },
            {
              title: 'FileId',
              key: 'parentFolderId',
              render: (_text: string, record) => {
                return record.details?.id;
              },
            },
            {
              title: 'Type',
              dataIndex: 'type',
              render: (text: string) => {
                return <Tag color={suffixTagColor[text]}>{text}</Tag>;
              },
            },
          ]}
          dataSource={selectedItem.files}
          pagination={false}
        />
      </Paragraph>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(BasicInfo);

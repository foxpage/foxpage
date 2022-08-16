import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { Table, Tag, Typography } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import { suffixTagColor } from '@/constants/file';
import { GlobalContext } from '@/pages/system';
import { periodFormat } from '@/utils/period-format';

const { Paragraph } = Typography;

const mapStateToProps = (store: RootState) => ({
  selectedItem: store.store.list.selectedItem,
});

const mapDispatchToProps = {
  updatePreviewModalVisible: ACTIONS.updatePreviewModalVisible,
};

type BasicInfoProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const BasicInfo: React.FC<BasicInfoProps> = (props) => {
  const { selectedItem } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;

  if (!selectedItem) {
    return null;
  }

  return (
    <div>
      <Paragraph>
        {global.nameLabel}: {selectedItem.name}
      </Paragraph>
      <Paragraph>
        {global.creator}: {selectedItem.creator?.account}
      </Paragraph>
      <Paragraph>
        {global.application}: {selectedItem.application?.name}
      </Paragraph>
      <Paragraph>
        {global.createTime}: {periodFormat(selectedItem?.createTime, 'unknown')}
      </Paragraph>
      <Paragraph>
        {file.name}:
        <Table
          size="small"
          columns={[
            {
              title: 'Id',
              dataIndex: 'id',
            },
            {
              title: global.nameLabel,
              dataIndex: 'name',
            },
            {
              title: `${file.name}Id`,
              key: 'parentFolderId',
              render: (_text: string, record) => {
                return record.details?.id;
              },
            },
            {
              title: global.type,
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

import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { Form, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/list';
import GlobalContext from '@/pages/GlobalContext';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const mapStateToProps = (state: RootState) => ({
  editApp: state.group.application.list.editApp,
});

const mapDispatchToProps = {
  update: ACTIONS.updateApp,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const EditPanel = (props: IProps) => {
  const { editApp = {}, update } = props;
  const { locale } = useContext(GlobalContext);
  const { application } = locale.business;

  return (
    <div style={{ padding: 12 }}>
      <Form.Item {...formItemLayout} label={application.nameLabel}>
        <Input
          defaultValue={editApp.name}
          placeholder={application.nameLabel}
          onChange={(e) => update('name', e.target.value)}
        />
      </Form.Item>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPanel);

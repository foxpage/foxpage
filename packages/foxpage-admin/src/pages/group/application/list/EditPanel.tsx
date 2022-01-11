import React from 'react';
import { connect } from 'react-redux';

import { Form, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/list/index';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};

const mapStateToProps = (state: RootState) => ({
  editApp: state.group.application.list.editApp,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
  clearAll: ACTIONS.clearAll,
  changePageNum: ACTIONS.changePageNum,
  saveApp: ACTIONS.saveApp,
  update: ACTIONS.updateApp,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const EditPanel = (props: IProps) => {
  const { editApp = {}, update } = props;
  return (
    <div style={{ padding: 12 }}>
      <Form.Item {...formItemLayout} label="App name">
        <Input defaultValue={editApp.name} placeholder="App name" onChange={e => update('name', e.target.value)} />
      </Form.Item>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EditPanel);

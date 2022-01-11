import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Button, Form, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/user';
import OperationDrawer from '@/components/business/OperationDrawer';
import { OrganizationUrlParams } from '@/types/index';

const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

const mapStateToProps = (store: RootState) => ({
  editDrawerOpen: store.group.user.addDrawerOpen,
});

const mapDispatchToProps = {
  addUser: ACTIONS.addOrganizationUser,
  updateAccountDrawerOpen: ACTIONS.updateAccountDrawerOpen,
};

type TeamEditDrawerType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Drawer: React.FC<TeamEditDrawerType> = props => {
  const { organizationId } = useParams<OrganizationUrlParams>();
  const { editDrawerOpen, addUser, updateAccountDrawerOpen } = props;
  const [account, setAccount] = useState<string>('');

  useEffect(() => {
    setAccount('');
  }, [editDrawerOpen]);

  return (
    <OperationDrawer
      open={editDrawerOpen}
      title="Add User"
      onClose={() => {
        updateAccountDrawerOpen(false);
      }}
      width={480}
      destroyOnClose
      actions={
        <Button
          type="primary"
          onClick={() => {
            addUser({ account, organizationId });
          }}
        >
          Apply
        </Button>
      }
    >
      <div style={{ padding: 12 }}>
        <Form.Item {...formItemLayout} label="Account">
          <Input value={account} placeholder="Account" onChange={e => setAccount(e.target.value)} />
        </Form.Item>
      </div>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);

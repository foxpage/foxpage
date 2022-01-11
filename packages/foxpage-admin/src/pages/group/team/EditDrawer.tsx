import React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Button, Form, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/team';
import OperationDrawer from '@/components/business/OperationDrawer';
import { OrganizationUrlParams } from '@/types/index';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const mapStateToProps = (store: RootState) => ({
  editTeam: store.group.team.editTeam,
  editDrawerOpen: store.group.team.editDrawerOpen,
});

const mapDispatchToProps = {
  addTeam: ACTIONS.addTeam,
  updateTeam: ACTIONS.updateTeam,
  closeDrawer: ACTIONS.closeDrawer,
  update: ACTIONS.updateEditTeamValue,
};

type TeamEditDrawerType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Drawer: React.FC<TeamEditDrawerType> = props => {
  const { editTeam, editDrawerOpen, update, addTeam, updateTeam, closeDrawer } = props;
  const { organizationId } = useParams<OrganizationUrlParams>();

  return (
    <OperationDrawer
      open={editDrawerOpen}
      title={editTeam?.id ? 'Edit' : 'Add'}
      onClose={closeDrawer}
      width={480}
      destroyOnClose
      actions={
        <Button
          type="primary"
          onClick={() => {
            editTeam?.id ? updateTeam(organizationId, editTeam) : addTeam(organizationId, editTeam);
          }}
        >
          Apply
        </Button>
      }
    >
      {editTeam ? (
        <div style={{ padding: 12 }}>
          <Form.Item {...formItemLayout} label="Team name">
            <Input
              defaultValue={editTeam.name}
              placeholder="Team name"
              onChange={e => update('name', e.target.value)}
            />
          </Form.Item>
        </div>
      ) : (
        <div></div>
      )}
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);

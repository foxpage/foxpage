import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { Button, Form, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/teams/list';
import OperationDrawer from '@/components/business/OperationDrawer';
import GlobalContext from '@/pages/GlobalContext';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const mapStateToProps = (store: RootState) => ({
  editTeam: store.teams.list.editTeam,
  editDrawerOpen: store.teams.list.editDrawerOpen,
});

const mapDispatchToProps = {
  addTeam: ACTIONS.addTeam,
  updateTeam: ACTIONS.updateTeam,
  closeDrawer: ACTIONS.closeDrawer,
  update: ACTIONS.updateEditTeamValue,
};

interface CProps {
  organizationId: string;
}

type TeamEditDrawerType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & CProps;

const Drawer: React.FC<TeamEditDrawerType> = (props) => {
  const { organizationId, editTeam, editDrawerOpen, update, addTeam, updateTeam, closeDrawer } = props;

  // get multi-language
  const { locale } = useContext(GlobalContext);
  const { global, team } = locale.business;

  return (
    <OperationDrawer
      open={editDrawerOpen}
      title={editTeam?.id ? team.edit : team.add}
      onClose={closeDrawer}
      width={480}
      destroyOnClose
      actions={
        <Button
          type="primary"
          onClick={() => {
            editTeam?.id ? updateTeam(organizationId, editTeam) : addTeam(organizationId, editTeam);
          }}>
          {global.apply}
        </Button>
      }>
      {editTeam ? (
        <div style={{ padding: 12 }}>
          <Form.Item {...formItemLayout} label={team.nameLabel}>
            <Input
              defaultValue={editTeam.name}
              placeholder={team.nameLabel}
              onChange={(e) => update('name', e.target.value)}
            />
          </Form.Item>
        </div>
      ) : (
        <div />
      )}
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);

import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { Button, Form, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/teams/list';
import { OperationDrawer } from '@/components/index';
import { GlobalContext } from '@/pages/system';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const mapStateToProps = (store: RootState) => ({
  pageInfo: store.teams.list.pageInfo,
  editTeam: store.teams.list.editTeam,
  editDrawerOpen: store.teams.list.editDrawerOpen,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.openDrawer,
  updateTeamValue: ACTIONS.updateEditTeamValue,
  saveTeam: ACTIONS.saveTeam,
  fetchList: ACTIONS.fetchTeamList,
};

type TeamEditDrawerType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Drawer: React.FC<TeamEditDrawerType> = (props) => {
  const { pageInfo, editTeam, editDrawerOpen, closeDrawer, updateTeamValue, saveTeam, fetchList } = props;

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { global, team } = locale.business;

  const handleApply = () => {
    if (organizationId) {
      saveTeam({ organizationId, team: editTeam }, () => {
        closeDrawer(false);

        // refresh team list
        fetchList({ organizationId, page: pageInfo.page, size: pageInfo.size });
      });
    }
  };

  return (
    <OperationDrawer
      destroyOnClose
      title={editTeam?.id ? team.edit : team.add}
      width={480}
      open={editDrawerOpen}
      actions={
        <Button type="primary" onClick={handleApply}>
          {global.apply}
        </Button>
      }
      onClose={() => closeDrawer(false)}>
      {editTeam ? (
        <div style={{ padding: '24px 12px' }}>
          <Form.Item {...formItemLayout} label={global.nameLabel}>
            <Input
              defaultValue={editTeam.name}
              placeholder={team.nameLabel}
              onChange={(e) => updateTeamValue('name', e.target.value)}
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

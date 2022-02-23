import React from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import { RootState } from 'typesafe-actions';

import { FileTypeEnum } from '@/constants/global';

import { SYSTEM_PAGE } from '../constant';

import PageEditor from './PageEditor';

const mapStateToProps = (store: RootState) => ({
  selectedComponentId: store.builder.template.selectedComponentId,
  versionType: store.builder.template.versionType,
});

type EditorDrawerProps = ReturnType<typeof mapStateToProps>;

const EditorDrawer: React.FC<EditorDrawerProps> = props => {
  const { selectedComponentId, versionType } = props;

  return (
    <>
      <div style={{ height: '100%' }}>
        {(!selectedComponentId || selectedComponentId === SYSTEM_PAGE) && versionType === FileTypeEnum.page && (
          <PageEditor />
        )}
      </div>
    </>
  );
};

export default connect(mapStateToProps, {})(EditorDrawer);

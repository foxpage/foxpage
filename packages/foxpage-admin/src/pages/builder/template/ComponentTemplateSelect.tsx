import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { message } from 'antd';
import _ from 'lodash';
import { RootState } from 'typesafe-actions';

import { saveComponent, updateContentRelation } from '@/actions/builder/template';
import * as ACTIONS from '@/actions/builder/template-select';
import { FileTypeEnum } from '@/constants/index';
import GlobalContext from '@/pages/GlobalContext';
import { getComponentTemplateId, updateRelation } from '@/services/builder';
import { ComponentStructure } from '@/types/builder';
import { getTemplateRelationKey } from '@/utils/relation';

import TemplateSelectModal from './TemplateSelectModal';

const mapStateToProps = (store: RootState) => ({
  pageTemplateSelectModalOpen: store.builder.templateSelect.pageTemplateSelectModalOpen,
  version: store.builder.template.version,
  applicationId: store.builder.page.applicationId,
  selectedComponent: store.builder.template.selectedComponent,
  selectedWrapperComponent: store.builder.template.selectedWrapperComponent,
});

const mapDispatchToProps = {
  updateComponentTemplateSelectModalOpen: ACTIONS.updateComponentTemplateSelectModalOpen,
  saveComponent: saveComponent,
  updateContentRelation: updateContentRelation,
};

type ComponentTemplateSelectType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ComponentTemplateSelect: React.FC<ComponentTemplateSelectType> = props => {
  const {
    applicationId,
    selectedComponent,
    selectedWrapperComponent,
    version,
    pageTemplateSelectModalOpen,
    updateComponentTemplateSelectModalOpen,
    saveComponent,
    updateContentRelation,
  } = props;
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;

  useEffect(() => {
    setTemplateId(
      getComponentTemplateId(
        selectedComponent.wrapper ? selectedWrapperComponent : selectedComponent,
        version?.content?.relation,
      ),
    );
  }, [version]);

  const [templateId, setTemplateId] = useState<string | undefined>();

  const handleOnOk = (templateId?: string) => {
    if (!templateId) {
      message.warning(builder.selectTemplateError);
      return;
    }
    if (templateId) {
      const relationKey = getTemplateRelationKey(templateId);
      const component = _.cloneDeep<ComponentStructure>(
        selectedComponent.wrapper ? selectedWrapperComponent : selectedComponent,
      );
      component.directive = { tpl: `{{${relationKey}}}` };
      saveComponent(applicationId, {
        id: version.content.id,
        type: 'update',
        parentId: component.parentId,
        content: component,
      });
      updateContentRelation(
        updateRelation(version.content.relation, { [relationKey]: { id: templateId, type: 'template' } }),
      );
    } else {
      updateComponentTemplateSelectModalOpen(false);
    }
  };

  return (
    <TemplateSelectModal
      title={builder.selectTemplateModalTitle}
      fileType={FileTypeEnum.template}
      open={pageTemplateSelectModalOpen}
      templateId={templateId}
      onCancel={() => {
        updateComponentTemplateSelectModalOpen(false);
      }}
      onOk={handleOnOk}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ComponentTemplateSelect);

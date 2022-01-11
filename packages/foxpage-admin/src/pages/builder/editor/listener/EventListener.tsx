import React from 'react';
import { connect } from 'react-redux';

import _ from 'lodash';
import { RootState } from 'typesafe-actions';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import * as widgets from '@foxpage/foxpage-component-editor-widgets';

import * as ACTIONS from '@/actions/builder/template';
import { Listeners } from '@/components/widgets/listeners';

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.page.applicationId,
  folderId: store.builder.page.folderId,
  selectedComponent: store.builder.template.selectedComponent,
  selectedWrapperComponent: store.builder.template.selectedWrapperComponent,
  componentList: store.builder.template.componentList,
  loadedComponent: store.builder.viewer.loadedComponent,
});

const mapDispatchToProps = {
  updateEditorValue: ACTIONS.updateEditorValue,
  save: ACTIONS.saveComponentEditorValue,
};

type EventListenerType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const EventListener: React.FC<EventListenerType> = props => {
  const { applicationId, folderId, selectedComponent, componentList, loadedComponent, save, updateEditorValue } = props;

  const handlePropChange = (keys: string, val: string) => {
    const componentProps = _.cloneDeep(selectedComponent.props) || {};
    const keyPath: string[] = keys.split('.');
    const key = keyPath.pop() as string;
    const props = keyPath.reduce((a, c) => {
      if (typeof a[c] !== 'undefined') return a[c];
      a[c] = {};
      return a[c];
    }, componentProps);
    if (val === undefined) {
      delete props[key];
    } else {
      props[key] = val;
    }

    updateEditorValue('props', componentProps);
    save(applicationId, false, folderId);
  };

  const newComponentList = componentList
    .filter(component => {
      const isWrapper =
        component.children && component.children.length > 0 && component.children[0].wrapper
          ? component.children[0].wrapper === component.id
          : false;
      return !isWrapper;
    })
    .map(component => {
      return {
        ...component,
        editor: loadedComponent[`${component.name}_editor`],
      };
    });

  if (!selectedComponent) {
    return null;
  }

  const editorParams = {
    componentProps: _.cloneDeep(selectedComponent.props) || {},
    editor: widgets,
    components: newComponentList,
    propChange: handlePropChange,
    applyState: () => {},
    propsChange: () => {},
  };

  const { schema } = selectedComponent;

  const listeners: string[] = [];
  if (schema) {
    const { properties = {} } = schema;
    for (const key in properties) {
      if (properties[key]?.description?.includes('function')) {
        listeners.push(key);
      }
    }
  }

  return (
    <React.Fragment>
      {listeners.length > 0 ? (
        <EditContext.Provider value={editorParams}>
          <Listeners propKey={listeners} />
        </EditContext.Provider>
      ) : (
        <div style={{ padding: '12px 16px' }}>No Listeners</div>
      )}
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EventListener);

import React, { useContext, useMemo } from 'react';

import _ from 'lodash';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import * as widgets from '@foxpage/foxpage-component-editor-widgets';

import { Listeners } from '../components/listeners';
import { ComponentStructure } from '../interface';
import ViewerContext from '../viewerContext';

interface EventListenerProps {
  selectedComponent?: ComponentStructure;
  updateEditorValue: (key: string, value: unknown) => void;
  saveComponent: (isWrapper: boolean) => void;
}

const EventListener: React.FC<EventListenerProps> = props => {
  const { selectedComponent, saveComponent, updateEditorValue } = props;
  const { loadedComponent, componentList, foxpageI18n } = useContext(ViewerContext);

  const handlePropChange = (keys: string, val: string) => {
    if (selectedComponent) {
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
      saveComponent(false);
    }
  };

  const newComponentList = useMemo(() => {
    return componentList
      .filter(component => {
        const isWrapper =
          component.children && component.children.length > 0 && component.children[0].wrapper
            ? component.children[0].wrapper === component.id
            : false;
        return !isWrapper;
      })
      .map(component => {
        const editorEntry = component.resource?.['editor-entry'];
        const editor = editorEntry && editorEntry.length > 0 ? editorEntry[0] : undefined;
        if (editor) {
          return {
            ...component,
            editor: loadedComponent[editor.name],
          };
        }
        return component;
      });
  }, [componentList, loadedComponent]);

  if (!selectedComponent) {
    return null;
  }

  const editorParams = useMemo(() => {
    return {
      componentProps: _.cloneDeep(selectedComponent.props) || {},
      editor: widgets,
      components: newComponentList,
      propChange: handlePropChange,
      applyState: () => {},
      propsChange: () => {},
    };
  }, [selectedComponent, newComponentList]);

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
        <div style={{ padding: '12px 16px' }}>{foxpageI18n.noListener}</div>
      )}
    </React.Fragment>
  );
};

export default EventListener;

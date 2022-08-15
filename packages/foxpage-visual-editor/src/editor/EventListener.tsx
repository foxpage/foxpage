import React, { useContext, useMemo } from 'react';

import _ from 'lodash';

import { EditContext } from '@foxpage/foxpage-component-editor-context';
import * as widgets from '@foxpage/foxpage-component-editor-widgets';

import { Listeners } from '@/components/listeners';
import { FoxContext } from '@/context/index';
import { RenderStructureNode } from '@/types/index';

interface EventListenerProps {
  component: RenderStructureNode;
  updateEditorValue: (key: string, value: unknown, autoSave?: boolean) => void;
}

const EventListener: React.FC<EventListenerProps> = (props) => {
  const { loadedComponents, componentMap, structureList = [], foxI18n } = useContext(FoxContext);
  const { updateEditorValue, component } = props;

  const handlePropChange = (keys: string, val: string) => {
    if (component) {
      const componentProps = _.cloneDeep(component.props) || {};
      const keyPath: string[] = keys.split('.');
      const key = keyPath.pop() as string;
      const props = keyPath.reduce((a: string | RenderStructureNode['props'], c: string) => {
        if (typeof a[c] !== 'undefined') return a[c];
        a[c] = {};
        return a[c];
      }, componentProps);
      if (val === undefined) {
        delete props[key];
      } else {
        props[key] = val;
      }

      updateEditorValue('props', componentProps, true);
    }
  };

  const newComponentList = useMemo(() => {
    return (
      structureList
        // .filter((node) => {
        //   const isWrapper =
        //     node.children && node.children.length > 0 && node.children[0].wrapper
        //       ? node.children[0].wrapper === node.id
        //       : false;
        //   return !isWrapper;
        // })
        .map((node) => {
          const component = componentMap[node.name];
          const editorEntry = component?.resource?.['editor-entry'];
          const editor = editorEntry && editorEntry.length > 0 ? editorEntry[0] : undefined;
          if (editor) {
            return {
              ...component,
              ...node,
              editor: loadedComponents[editor.name],
            };
          }
          return {
            ...component,
            ...node,
          };
        })
    );
  }, [structureList, loadedComponents]);

  if (!component) {
    return null;
  }

  const editorParams = useMemo(() => {
    return {
      componentProps: _.cloneDeep(component.props) || {},
      editor: widgets,
      components: newComponentList,
      propChange: handlePropChange,
      applyState: () => {},
      propsChange: () => {},
    };
  }, [component, newComponentList]);

  const selectComponent = componentMap[component.name];
  const { schema = {} } = selectComponent || {};

  const listeners: string[] = [];
  if (schema) {
    if (schema instanceof Object) {
      const { properties = {} } = schema;
      for (const key in properties) {
        if (properties[key]?.description?.includes('function')) {
          listeners.push(key);
        }
      }
    }
  }

  return (
    <div style={{ padding: 4 }}>
      {listeners.length > 0 ? (
        <EditContext.Provider value={editorParams as any}>
          <Listeners propKey={listeners} />
        </EditContext.Provider>
      ) : (
        <div style={{ padding: '12px 16px' }}>{foxI18n.noListener}</div>
      )}
    </div>
  );
};

export default EventListener;

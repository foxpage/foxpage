import React, { useEffect, useState } from 'react';

import { useEditorContext } from '../context';

import Main from './Main';
import Simple from './Simple';

const STRUCTURE = 'structure';

const SidebarIndex = () => {
  const [menu, setMenu] = useState<{ [key in 'structure' | 'components']?: boolean }>({});
  const {
    events: { handleStructurePinned },
    structurePinned,
  } = useEditorContext();

  const handlePushpin = (value) => {
    handleStructurePinned(value);
    setMenu({ ...menu, [STRUCTURE]: true });
  };
  // if pinned and not
  useEffect(() => {
    if (structurePinned && (!Object.keys(menu).includes(STRUCTURE) || menu.structure !== true)) {
      setMenu({ ...menu, [STRUCTURE]: true });
    }
  }, [structurePinned]);

  return (
    <div className="flex h-full">
      <div className="flex-0 basis-[38px] border-r border-r-solid border-slate-100">
        <Simple onMenuChange={setMenu} menu={menu} />
      </div>

      <div
        className={`${menu.structure || structurePinned ? 'w-auto h-full' : 'w-0 h-0'} foxpage-structure`}
        style={
          !structurePinned
            ? {
                boxShadow:
                  '2px 0 4px -32px rgb(0 0 0 / 4%), 8px 0 24px 0 rgb(0 0 0 / 5%), 8px 0 4px 0 rgb(0 0 0 / 3%)',
              }
            : undefined
        }>
        <Main
          expanded={!!menu.structure || structurePinned}
          structurePinned={structurePinned}
          onPushPin={handlePushpin}
          onClose={() => {
            handlePushpin(false);
            setMenu({ ...menu, [STRUCTURE]: false });
          }}
        />
      </div>
    </div>
  );
};

export default SidebarIndex;

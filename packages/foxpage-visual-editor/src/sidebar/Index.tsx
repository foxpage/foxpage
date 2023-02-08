import React, { useEffect, useState } from 'react';

import Main from './Main';
import Simple from './Simple';

const STRUCTURE = 'structure';

const SidebarIndex = ({
  structurePinned,
  onStructurePinned,
}: {
  structurePinned: boolean;
  onStructurePinned: (v: boolean) => void;
}) => {
  const [menu, setMenu] = useState<{ [key in 'structure' | 'components']?: boolean }>({});

  const handlePushpin = (value) => {
    onStructurePinned(value);
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
        <Simple
          onStructurePushpin={onStructurePinned}
          structurePinned={structurePinned}
          onMenuChange={setMenu}
          menu={menu}
        />
      </div>

      <div className="relative">
        {(menu.structure || structurePinned) && (
          <div
            className={`h-full${!structurePinned ? ' absolute left-0 top-0 bottom-0 bg-white z-50' : ''}`}
            style={
              !structurePinned
                ? {
                    boxShadow:
                      '2px 0 4px -32px rgb(0 0 0 / 4%), 8px 0 24px 0 rgb(0 0 0 / 5%), 8px 0 4px 0 rgb(0 0 0 / 3%)',
                  }
                : undefined
            }>
            <Main
              structurePinned={structurePinned}
              onPushPin={handlePushpin}
              onClose={() => {
                handlePushpin(false);
                setMenu({ ...menu, [STRUCTURE]: false });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarIndex;

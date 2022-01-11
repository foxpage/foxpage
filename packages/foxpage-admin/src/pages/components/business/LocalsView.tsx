import React from 'react';

import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { LocaleTag } from './LocaleTag';

const MAX_LOCALE_SHOW = 5;

const MoreContent = styled.div`
  display: inline-block;
  padding: 0 8px;
  :hover {
    background-color: #efefef;
    cursor: default;
  }
`;

function LocalsView(props: { maxLocaleCount?: number; locales: string[] }) {
  const { locales, maxLocaleCount = MAX_LOCALE_SHOW } = props;

  return (
    <span>
      {locales &&
        locales.map((tag: React.Key | null | undefined, idx: number) => {
          if (idx < maxLocaleCount) {
            return (
              <LocaleTag color="green" key={tag}>
                {tag}
              </LocaleTag>
            );
          }
          return null;
        })}
      {locales && locales.length > maxLocaleCount && (
        <Tooltip title={locales.slice(maxLocaleCount, locales.length).join(', ')}>
          <MoreContent title={`More ${locales.length - maxLocaleCount} locales`}>
            ... (More {locales.length - maxLocaleCount} locales){' '}
          </MoreContent>
        </Tooltip>
      )}
    </span>
  );
}

LocalsView.defaultProps = {
  locales: [],
};

LocalsView.propTypes = {
  locales: PropTypes.array,
};

export default LocalsView;

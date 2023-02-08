import React from 'react';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { LocaleTag } from '@/components/index';
import { FileTag } from '@/types/index';

const MAX_LOCALE_SHOW = 5;

const MoreContent = styled.div`
  display: inline-block;
  padding: 0 8px;
  :hover {
    background-color: #efefef;
    cursor: default;
  }
`;
const Container = styled.span`
  position: relative;
`;
const ErrorHint = styled.span`
  position: absolute;
  top: -6px;
  left: -2px;
  color: #cf1322;
  font-size: 14px;
`;

function LocalsView(props: { maxLocaleCount?: number; locales: FileTag[] }) {
  const { locales, maxLocaleCount = MAX_LOCALE_SHOW } = props;

  return (
    <span>
      {locales &&
        locales.map((tag: any, idx: number) => {
          if (idx < maxLocaleCount) {
            return (
              <Container key={`${tag.locale}-${idx}`}>
                <Tooltip title={tag.duplicate ? 'Duplicated' : ''}>
                  <LocaleTag color="green" key={`${tag.locale}-${idx}`}>
                    {tag.locale}
                  </LocaleTag>
                  {tag.duplicate && (
                    <ErrorHint>
                      <InfoCircleOutlined />
                    </ErrorHint>
                  )}
                </Tooltip>
              </Container>
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

import { message } from 'antd';

import { getBusinessI18n } from '@/foxI18n/index';
import { PageContent, RelationDetails } from '@/types/index';

import { initRelation } from '../utils';

type ValidatorOptions = {
  relations: RelationDetails;
  showMsg?: boolean;
};

/**
 * content validator
 * @param pageContent page content
 * @param opt options
 */
export const validateContent = (pageContent: PageContent, opt: ValidatorOptions) => {
  const { content } = pageContent;
  const { relations, showMsg = true } = opt;
  const { relation, invalids } = initRelation(content, relations);
  content.relation = relation;
  if (invalids.length > 0) {
    if (showMsg) {
      const {
        builder: { relationMatchError },
      } = getBusinessI18n();
      if (invalids.length > 5) {
        message.error(`[ ${[invalids.splice(0, 5)].toString()} ... ] ${relationMatchError}`);
      } else {
        message.error(`[ ${invalids.toString()} ] ${relationMatchError}`);
      }
    }
    return false;
  }
  return true;
};

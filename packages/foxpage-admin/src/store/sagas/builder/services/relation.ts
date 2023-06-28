import { message } from 'antd';

import { searchVariable } from '@/apis/application';
import { getBusinessI18n } from '@/foxI18n/index';
import { store } from '@/store/index';
import {
  Content,
  RelationDetails,
  RelationSearchOption,
  ResponseBody,
  VariableEntity,
  VariableSearchParams,
} from '@/types/index';

import { initRelation, initVariableRelation } from '../utils';

export async function getRelation(content: Content, relations: RelationDetails, opt?: RelationSearchOption) {
  let serverVariables: RelationDetails['variables'] = [];
  // init & check relation (current only variables)
  const { relation, invalids } = initRelation(content, relations);
  const realInvalids: string[] = [];
  if (invalids.length > 0) {
    const { application, file } = store.getState().builder.main;
    const map = {};
    const invalidNames = invalids.map((item) => {
      const name = item.split(':')[0]?.split('[')[0];
      map[item] = name;
      return name;
    });

    const result: ResponseBody<VariableEntity[]> = await searchVariable({
      applicationId: application?.id || opt?.applicationId,
      id: file.folderId,
      names: Array.from(new Set(invalidNames)),
      size: 100,
    } as unknown as VariableSearchParams);

    // init invalids
    if (result.code === 200) {
      serverVariables = (result.data || []).map((item) => ({
        name: item.name,
        ...item.content,
        id: item.id,
      }));
      invalids.forEach((item) => {
        const initd = initVariableRelation(map[item], result.data);
        if (initd) {
          relation[item] = initd;
        } else {
          realInvalids.push(map[item]);
        }
      });
    } else {
      const {
        global: { fetchListFailed },
      } = getBusinessI18n();
      message.error(fetchListFailed);
    }

    // still invalids
    if (realInvalids.length > 0) {
      const {
        builder: { relationMatchError },
      } = getBusinessI18n();
      message.error(`[ ${realInvalids.toString()} ] ${relationMatchError}`);
    }
  }

  return { relation, realInvalids, data: { variables: serverVariables } };
}

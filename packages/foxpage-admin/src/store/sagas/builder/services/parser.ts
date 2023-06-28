import { message } from 'antd';
import Axios from 'axios';

import { PageParseOption, PARSE_PAGE_PATH, parsePage } from '@foxpage/foxpage-js-sdk';
import { FPFile, Page, RelationInfo, RenderAppInfo } from '@foxpage/foxpage-types';

import { FOXPAGE_USER_TICKET } from '@/constants/index';
import { getBusinessI18n } from '@/foxI18n/index';
import { PageContent, ParseOptions } from '@/types/index';

const parsePageInServer = async (page: Page, opt: PageParseOption, host: string) => {
  const token = localStorage.getItem(FOXPAGE_USER_TICKET);
  const url = `${PARSE_PAGE_PATH}?host=${host}&locale=${opt.locale}&_foxpage_ticket=${token}`;
  const result = await Axios.post(url, {
    page,
    opt: {
      appId: opt.appInfo.appId,
      relationInfo: opt.relationInfo,
      locale: opt.locale,
      file: opt.file,
    },
  });
  return result;
};

/**
 * parse page content
 * @param data page content
 * @param opt parse options
 * @returns parsed
 */
export const parse = async (data: PageContent, opt: ParseOptions): Promise<PageContent | null> => {
  const { content, relations = {} } = data;
  const { application, locale = 'en-US', file, parseInLocal = true, extendContent } = opt;
  const { type } = file || {};
  const appInfo = {
    appId: application.id,
    slug: application.slug,
    configs: {},
  } as RenderAppInfo;

  const relationInfo = {
    templates: relations.templates || [], // Template[]
    variables: relations.variables || [], // Variable[]
    conditions: relations.conditions || [], // Condition[]
    functions: relations.functions || [], //FPFunction[]
    blocks: (relations.blocks || []).concat(extendContent?.relations?.blocks || []), // Block[]
  };

  const parseOpt = {
    appInfo,
    relationInfo: relationInfo as unknown as RelationInfo,
    locale,
    file: file as unknown as FPFile,
  };
  const _content = { ...content, type: type } as unknown as Page;

  // local parse
  if (parseInLocal) {
    const result = await parsePage(_content, parseOpt);
    return { ...data, content: { ..._content, ...result.content } } as PageContent;
  }

  // remote parse
  try {
    const host = application.host?.[0]?.url || '';
    if (!host) {
      throw new Error('no host');
    }
    const result = (await parsePageInServer(_content, parseOpt, `${host}/${application.slug}`)) as Record<
      string,
      any
    >;

    if (result.status === 200) {
      if (result.data.status) {
        const schemas = result.data.result.parsedPage;
        return { ...data, content: { ..._content, schemas } } as PageContent;
      } else {
        const {
          builder: { parsePageFailed },
        } = getBusinessI18n();
        message.error(parsePageFailed);
        console.error(result.data.result);
        return { ...data, content: { ..._content, schemas: [] } } as PageContent;
      }
    }

    return null;
  } catch (e) {
    console.error('parse page in server failed:', e);
    // local parse
    const result = await parsePage(_content, parseOpt);
    return { ...data, content: { ..._content, ...result.content } } as PageContent;
  }
};

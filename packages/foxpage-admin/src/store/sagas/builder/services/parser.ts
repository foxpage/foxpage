import { message } from 'antd';
import Axios from 'axios';

import { PageParseOption, PARSE_PAGE_PATH, parsePage } from '@foxpage/foxpage-js-sdk';
import { FPFile, Page, RelationInfo, RenderAppInfo } from '@foxpage/foxpage-types';

import { getBusinessI18n } from '@/foxI18n/index';
import { Application, File, PageContent } from '@/types/index';

export type ParseOptions = {
  application: Application;
  locale?: string;
  file: File;
  parseInLocal?: boolean; // local(client) parse
};

const parsePageInServer = async (page: Page, opt: PageParseOption, host: string) => {
  const url = `${PARSE_PAGE_PATH}?host=${host}&locale=${opt.locale}`;
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
  const { application, locale = 'en-US', file, parseInLocal = true } = opt;

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
  };

  const parseOpt = {
    appInfo,
    relationInfo: relationInfo as unknown as RelationInfo,
    locale,
    file: file as unknown as FPFile,
  };

  // local parse
  if (parseInLocal) {
    const result = await parsePage(content as unknown as Page, parseOpt);
    return { ...data, content: { ...content, ...result.page } } as PageContent;
  }

  // remote parse
  try {
    // @ts-ignore
    if (APP_CONFIG.env === 'dev') {
      throw new Error('is develop');
    }

    const host = application.host?.[0]?.url || '';
    if (!host) {
      throw new Error('no host');
    }
    const result = (await parsePageInServer(
      content as unknown as Page,
      parseOpt,
      `${host}/${application.slug}`,
    )) as Record<string, any>;

    if (result.status === 200) {
      if (result.data.status) {
        const schemas = result.data.result.parsedPage;
        return { ...data, content: { ...content, schemas } };
      } else {
        const {
          builder: { parsePageFailed },
        } = getBusinessI18n();
        message.error(parsePageFailed);
        console.error(result.data.result);
        return { ...data, content: { ...content, schemas: [] } };
      }
    }

    return null;
  } catch (e) {
    console.error('parse page in server failed:', e);
    // local parse
    const result = await parsePage(content as unknown as Page, parseOpt);
    return { ...data, content: { ...content, ...result.page } } as PageContent;
  }
};

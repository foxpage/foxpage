import _ from 'lodash';

import { Application, Component, File, Mock, PageContent, StructureNode } from '@/types/index';

import { format, FormatOptions } from './formatter';
import { merge } from './merger';
import { mock } from './mocker';
import { parse, ParseOptions } from './parser';

interface ParseContentOptions extends ParseOptions {
  extendContent?: PageContent;
  mocks: Mock[];
  file?: File;
}

/**
 * get mocks
 * page & template mocks
 * @param data page content
 * @returns
 */
export const getMocks = (data: PageContent) => {
  const mocks: Mock[] = data.mock ? [data.mock] : [];
  data.relations?.templates?.forEach((template) => {
    if (template.mock) {
      mocks.push(template.mock);
    }
  });
  return mocks;
};

/**
 * parse content
 * @param data page content
 * @param opt parse options
 * @returns
 */
export const parseContent = async (data: PageContent, opt: ParseContentOptions) => {
  const { application, locale, extendContent, file } = opt || {};
  const { type } = file || {};
  let parsed: PageContent | null = Object.assign({}, data);

  // merge
  if (extendContent) {
    parsed = merge(parsed, extendContent);
    if (!parsed) {
      return null;
    }
  }

  const parsedSchemas = _.cloneDeep(parsed.content.schemas);
  backupParsedProps(parsedSchemas);
  parsed = { ...parsed, content: { ...parsed.content, schemas: parsedSchemas } };

  // mock
  if (!!parsed.mock?.enable && opt.mocks.length > 0) {
    parsed = mock(parsed, {
      applicationId: application.id,
      extendContent,
      mocks: opt.mocks,
    });
    if (!parsed) {
      return null;
    }
  }

  // parse
  if (type === 'page') {
    parsed = await parse(parsed, {
      application,
      locale,
    });
  }

  return parsed;
};

/**
 * format content
 * @param parsed parsed content
 * @param opt options
 * @returns
 */
export const formatContent = (parsed: PageContent, opt: FormatOptions) => {
  const result = format(parsed, {
    ...opt,
  });
  return result;
};

/**
 * init state
 * parse,mock,merge,formatted result
 * all events & changed will use it to get updated data
 * @param page
 * @param opt
 * @returns
 */
export const initState = async (
  page: PageContent,
  opt: {
    application: Application;
    components: Component[];
    extendPage?: PageContent;
    file?: File;
    locale?: string;
  },
) => {
  console.time('INIT_STATE');

  // get mocks
  const mocks = getMocks(page);

  // parse content
  const parsed = await parseContent(page, {
    application: opt.application,
    extendContent: _.cloneDeep(opt.extendPage),
    locale: opt.locale,
    mocks,
    file: opt.file,
  });
  if (!parsed) {
    return null;
  }

  // format content
  const formatted = formatContent(parsed, {
    origin: page,
    extend: opt.extendPage,
    mocks,
    components: opt.components,
  });

  console.timeEnd('INIT_STATE');
  return formatted;
};

const backupParsedProps = (schemas: StructureNode[] = []) => {
  schemas.forEach((item) => {
    if (item.children) {
      backupParsedProps(item.children);
    }
    item.__parsedProps = { ...item.props };
  });
};

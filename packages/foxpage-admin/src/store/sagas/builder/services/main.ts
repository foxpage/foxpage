import _ from 'lodash';

import { FileType } from '@/constants/global';
import { InitStateParams, Mock, PageContent, ParseOptions, StructureNode } from '@/types/index';

import { format, FormatOptions } from './formatter';
import { merge } from './merger';
import { mock } from './mocker';
import { parse } from './parser';

interface ParseContentOptions extends ParseOptions {
  mocks: Mock[];
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
  const { application, extendContent, mocks = [], file } = opt || {};
  let parsed: PageContent | null = Object.assign({}, data);
  let merged: PageContent | null = null;
  let mocked: PageContent | null = null;

  // merge
  if (extendContent) {
    merged = merge(parsed, extendContent);
    parsed = merged;
    if (!parsed) {
      return null;
    }
  }

  const parsedSchemas = _.cloneDeep(parsed.content.schemas);
  backupParsedProps(parsedSchemas);
  parsed = { ...parsed, content: { ...parsed.content, schemas: parsedSchemas } };

  // mock
  if (!!parsed.mock?.enable && mocks.length > 0) {
    mocked = mock(parsed, {
      applicationId: application.id,
      extendContent,
      mocks,
    });
    parsed = mocked;
    if (!parsed) {
      return null;
    }
  }

  // parse
  if (file.type === FileType.page || file.type === FileType.block) {
    parsed = await parse(parsed, opt);
  }

  return { parsed, merged, mocked };
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
export const initState = async (page: PageContent, opt: InitStateParams) => {
  console.time('INIT_STATE');

  // get mocks
  const mocks = getMocks(page);

  // parse content
  const { parsed, merged } =
    (await parseContent(page, {
      application: opt.application,
      extendContent: _.cloneDeep(opt.extendPage),
      locale: opt.locale,
      mocks,
      file: opt.file,
      parseInLocal: opt.parseInLocal,
    } as any)) || {};
  if (!parsed) {
    return null;
  }

  // format content
  const formatted = formatContent(parsed, {
    origin: page,
    extend: opt.extendPage,
    mocks,
    components: opt.components,
    rootNode: opt.rootNode,
  });

  console.timeEnd('INIT_STATE');
  return { ...formatted, mergedContent: merged };
};

const backupParsedProps = (schemas: StructureNode[] = []) => {
  schemas.forEach((item) => {
    if (item.children) {
      backupParsedProps(item.children);
    }
    item.__parsedProps = { ...item.props };
  });
};

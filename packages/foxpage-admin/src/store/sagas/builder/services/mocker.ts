import { mocker } from '@foxpage/foxpage-js-sdk';
import { Mock as SDKMock, Page, RelationInfo, RenderAppInfo } from '@foxpage/foxpage-types';

import { Mock, PageContent } from '@/types/index';

type MockOptions = {
  extendContent?: PageContent;
  mocks: Mock[];
  applicationId: string;
};

/**
 * content mock
 * @param data
 * @param opt
 * @returns mocked page template
 */
export function mock(data: PageContent, opt: MockOptions) {
  const { applicationId, extendContent, mocks } = opt;
  const { content, relations } = data;

  // generate app info
  const appInfo = {
    appId: applicationId,
    slug: '/',
    configs: {},
  } as RenderAppInfo;

  // generate relation info
  const { templates = [], variables = [], conditions = [], functions = [] } = relations || {};
  const relationInfo = {
    templates,
    variables,
    conditions,
    functions,
    extendPage: extendContent || {},
  };

  try {
    const mockedContent = mocker.withMock(content as unknown as Page, (mocks as unknown) as SDKMock[], {
      appInfo,
      relationInfo: (relationInfo as unknown) as RelationInfo,
    });

    return ({
      ...data,
      content: mockedContent.page,
      relations: {
        ...data.relations,
        templates: mockedContent.templates,
      },
    } as unknown) as PageContent;
  } catch (e) {
    console.error('Mock content error:', e);
    return null;
  }
}

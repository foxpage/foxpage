import { mocker } from '@foxpage/foxpage-js-sdk';
import { Page, RelationInfo, RenderAppInfo } from '@foxpage/foxpage-types';

import { DslType } from '@/types/builder';

/**
 * mock content
 * @param page
 * @param extendPage
 * @param mocks
 * @param applicationId
 * @returns mocked page template
 */
export function mockContent(page: DslType, extendPage: DslType, mocks: any[], applicationId: string) {
  try {
    const { content, relations } = page;

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
      extendPage: extendPage || {},
    };

    const mockedContent = mocker.withMock(content as Page, mocks, {
      appInfo,
      relationInfo: (relationInfo as unknown) as RelationInfo,
    });

    return ({
      ...page,
      content: mockedContent.page,
      relations: {
        ...page.relations,
        templates: mockedContent.templates,
      },
    } as unknown) as DslType;
  } catch (e) {
    console.error('Mock content error:', e);
    return null;
  }
}

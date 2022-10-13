import { MockContent, MockContentSchemaItem } from '@/types/index';

export const wrapperMock = (content: MockContent | undefined) => {
  if (!content) {
    return undefined;
  }

  const { id, enable, schemas = [], relation = {} } = content;
  return { id, enable, schemas: wrapperSchemas(schemas), relation };
};

const wrapperSchemas = <T extends MockContentSchemaItem>(schemas: T[] = []) => {
  const list: T[] = [];
  schemas.forEach((item) => {
    const { id, name, props, type } = item;
    const node = { id, name, props, type } as T;
    list.push(node);
  });
  return list;
};

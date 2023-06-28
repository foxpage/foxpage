export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

export type JestMockedFunctionRecord<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? jest.MockedClass<T[K]> : T[K];
};

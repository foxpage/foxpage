import { PropsWithChildren, ReactElement } from 'react';

import { EditorBaseProps, EditorStyleProps,Props } from '../interface';

export interface ListenersType<P extends Props = Props> {
  <K extends keyof P>(props: PropsWithChildren<ListenersProps<P>>): ReactElement | null;
}

export type PickEvents<T extends Props> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type ListenersProps<P extends Props = Props> = {
  fold?: boolean;
  propKey: PickEvents<P>[];
};

declare const Listeners: ListenersType;
export default Listeners;

export interface OptionsAction<P = unknown> {
  onSuccess?(res?: P): void;
  onFail?(): void;
}

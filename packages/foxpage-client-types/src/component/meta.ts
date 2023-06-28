export interface ComponentMeta {
  notRender?: boolean;
  decorated?: boolean;

  // portal set
  isHtml?: boolean;
  isBody?: boolean;
  isHead?: boolean;
}

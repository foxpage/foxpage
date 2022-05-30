import { Creator } from '../../user';

interface ProjectContentTag {
  [tagName: string]: string;
}

interface ProjectContentType {
  id: string;
  title: string;
  fileId: string;
  tags: ProjectContentTag[];
  creator: Creator;
  fold?: boolean;
  urls: string[];
  isBase?: boolean;
  version?: string;
  extendId?: string;
  type?: string;
}

export { ProjectContentTag, ProjectContentType };

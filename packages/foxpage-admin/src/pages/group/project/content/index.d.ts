import CreatorType from '../../../../types/creator.d';
interface ProjectContentTag {
  [tagName: string]: string;
}

interface ProjectContentType {
  id: string;
  title: string;
  fileId: string;
  tags: ProjectContentTag[];
  creator: CreatorType;
  urls: string[];
}

export { ProjectContentTag, ProjectContentType };

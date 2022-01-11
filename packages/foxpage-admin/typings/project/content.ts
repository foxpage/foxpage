export interface ProjectContentSearchParams {
  applicationId: string;
  fileId: string;
  fileType: string;
}

export interface ProjectContentDeleteParams extends ProjectContentSearchParams {
  id: string;
}

import FoxpageApi from '../../../utils/foxpage-api-sdk';

export const fetchPageContents = (params: any) =>
  new Promise(resolve => {
    FoxpageApi.get('/pages/content-searchs', params, (rs: any) => {
      resolve(rs);
    });
  });
export const fetchTemplateContents = (params: any) =>
  new Promise(resolve => {
    FoxpageApi.get('/templates/content-searchs', params, (rs: any) => {
      resolve(rs);
    });
  });
export const addPageContent = (params: any) =>
  new Promise(resolve => {
    FoxpageApi.post('/pages/contents', params, (rs: any) => {
      resolve(rs);
    });
  });
export const addTemplateContent = (params: any) =>
  new Promise(resolve => {
    FoxpageApi.post('/templates/contents', params, (rs: any) => {
      resolve(rs);
    });
  });
export const updatePageContent = (params: any) =>
  new Promise(resolve => {
    FoxpageApi.put('/pages/contents', params, (rs: any) => {
      resolve(rs);
    });
  });
export const updateTemplateContent = (params: any) =>
  new Promise(resolve => {
    FoxpageApi.put('/templates/contents', params, (rs: any) => {
      resolve(rs);
    });
  });
export const deletePageContent = (params: any) =>
  new Promise(resolve => {
    FoxpageApi.put('/pages/content-status', params, (rs: any) => {
      resolve(rs);
    });
  });
export const deleteTemplateContent = (params: any) =>
  new Promise(resolve => {
    FoxpageApi.put('/templates/content-status', params, (rs: any) => {
      resolve(rs);
    });
  });

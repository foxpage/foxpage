import FoxPageApi from '@/utils/api-agent';

export const saveComponentsCategory = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.put('/components/category', params, (rs: unknown) => {
      resolve(rs);
    });
  });

export const getComponentsCategory = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.get('/components/category', params, (rs: unknown) => {
      resolve(rs);
    });
  });

export const removeComponentsCategory = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.delete('/components/category', params, (rs: unknown) => {
      resolve(rs);
    });
  });

export const getCategories = (params: any) =>
  new Promise((resolve) => {
    FoxPageApi.get('/components/category-types', params, (rs: unknown) => {
      resolve(rs);
    });
  });

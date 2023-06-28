const FOXPAGE_VISUAL_EDITOR = 'FOXPAGE_VISUAL_EDITOR';

export const cacheData = (data: Record<string, any>) => {
  localStorage.setItem(FOXPAGE_VISUAL_EDITOR, JSON.stringify(data));
};

export const getCache = () => {
  const data = JSON.parse(localStorage.getItem(FOXPAGE_VISUAL_EDITOR) || '{}');
  try {
    return data;
  } catch {
    console.error('Parse FOXPAGE_VISUAL_EDITOR cache failed.');
    return {};
  }
};

export const removeCache = () => {
  localStorage.removeItem(FOXPAGE_VISUAL_EDITOR);
};

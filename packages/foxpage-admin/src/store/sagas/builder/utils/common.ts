import shortId from '@/utils/short-id';

export const generateStructureId = () => {
  return `stru_${shortId(15)}`;
};

import copy from 'copy-to-clipboard';

let data: Record<string, any> | null = null;

export const copyToClipboard = async (value: any) => {
  // set to clipboard
  try {
    // await navigator.clipboard?.writeText(JSON.stringify(value || ''));
    copy(JSON.stringify(value || ''));
    data = value;
  } catch (error) {
    console.warn('set data to clipboard failed: ', error);
  }
};

export const getDataFromClipboard = async () => {
  // get from clipboard
  try {
    // const result = await navigator.clipboard?.readText();
    return data;
  } catch (error) {
    console.warn('get data from clipboard failed: ', error);
  }
  return null;
};

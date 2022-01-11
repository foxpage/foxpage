export const pageParams = {
  organizationId: 'orga_j9l4qJI9hAXWTer',
  applicationId: 'appl_uagWz8CC8WxD3Ux',
  folderId: 'fold_kPrzikuRoPxg9gg',
  fileId: 'file_Di7WjHpl3DWa4ox',
  contentId: 'cont_BTljKVs7yaUPRgF',
  fileType: 'page',
};

export const locales = ['en-US'];

export const pageInfo = { page: 1, size: 10, total: 1 };

export const variable = {
  id: 'file_bp5d5V7jNOgpnGT',
  name: 'arerererere',
  type: 'variable',
  contentId: 'cont_46luBSreOoci1B5',
  content: {
    id: 'cont_46luBSreOoci1B5',
    schemas: [
      {
        name: 'arerererere',
        type: 'data.static',
        props: {
          type: 'json',
          value: {
            label: 1,
          },
        },
      },
    ],
  },
  relations: {},
};

export const funcItem = {
  id: 'file_hdjbiL2p8k4bjPK',
  name: 'function1',
  type: 'function',
  contentId: 'cont_moorQo6e8hsk7tp',
  content: {
    id: 'cont_moorQo6e8hsk7tp',
    schemas: [
      {
        name: 'function1',
        type: 'javascript.function',
        props: {
          async: false,
          code: 'function(a,b){ return a+b }',
        },
      },
    ],
  },
};

export const condition = {
  id: 'file_7MZBki3jQDNZ8oC',
  name: 'erererer',
  type: 'condition',
  contentId: 'cont_APzkN2w9iKrGTax',
  content: {
    id: 'cont_APzkN2w9iKrGTax',
    schemas: [
      {
        name: 'erererer',
        type: 1,
        children: [
          {
            type: 'condition.expression',
            props: {
              key: 'erere',
              operation: 'eq',
              value: '',
            },
          },
        ],
      },
    ],
  },
};


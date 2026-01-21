import {
  ContentfulAsset,
  MarketingAdminFields,
  BannerFields,
  ContentfulEntry,
  CampaignFields,
} from '@dcl/schemas'
import {
  MarketingAdminFieldsWithoutLocales,
  ContentfulContentWithoutLocales,
} from '../modules/campaign/ContentfulClient.types'

const mockAdminEntryEn: ContentfulContentWithoutLocales<
  'Entry',
  MarketingAdminFieldsWithoutLocales
> = {
  metadata: {
    tags: [],
    concepts: [],
  },
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: 'ea2ybdmmn1kv',
      },
    },
    id: '7FJAHnPOiCEHMJhrZ3sRmG',
    type: 'Entry',
    createdAt: '2025-02-25T14:46:55.405Z',
    updatedAt: '2025-02-25T14:46:55.405Z',
    environment: {
      sys: {
        id: 'master',
        type: 'Link',
        linkType: 'Environment',
      },
    },
    publishedVersion: 6,
    revision: 1,
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: 'admin',
      },
    },
  },
  fields: {
    name: 'Test usage only',
    campaign: {
      sys: {
        type: 'Link',
        linkType: 'Entry',
        id: '1wljdcVnU32MZq9j5KY5jZ',
      },
    },
    marketplaceHomepageBanner: {
      sys: {
        type: 'Link',
        linkType: 'Entry',
        id: '2wT4mlAKsjJ5IZmbBHObgV',
      },
    },
    marketplaceCollectiblesBanner: {
      sys: {
        type: 'Link',
        linkType: 'Entry',
        id: '2wT4mlAKsjJ5IZmbBHObgV',
      },
    },
    marketplaceCampaignCollectiblesBanner: {
      sys: {
        type: 'Link',
        linkType: 'Entry',
        id: '2wT4mlAKsjJ5IZmbBHObgV',
      },
    },
    builderCampaignBanner: {
      sys: {
        type: 'Link',
        linkType: 'Entry',
        id: '2wT4mlAKsjJ5IZmbBHObgV',
      },
    },
  },
}

const mockAdminEntry: ContentfulEntry<MarketingAdminFields> = {
  metadata: {
    tags: [],
    concepts: [],
  },
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: 'ea2ybdmmn1kv',
      },
    },
    id: '7FJAHnPOiCEHMJhrZ3sRmG',
    type: 'Entry',
    createdAt: '2025-02-25T14:46:55.405Z',
    updatedAt: '2025-02-25T14:46:55.405Z',
    environment: {
      sys: {
        id: 'master',
        type: 'Link',
        linkType: 'Environment',
      },
    },
    publishedVersion: 6,
    revision: 1,
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: 'admin',
      },
    },
  },
  fields: {
    name: {
      'en-US': 'Test usage only',
    },
    campaign: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: '1wljdcVnU32MZq9j5KY5jZ',
        },
      },
    },
    marketplaceHomepageBanner: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: '2wT4mlAKsjJ5IZmbBHObgV',
        },
      },
    },
    marketplaceCollectiblesBanner: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: '2wT4mlAKsjJ5IZmbBHObgV',
        },
      },
    },
    marketplaceCampaignCollectiblesBanner: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: '2wT4mlAKsjJ5IZmbBHObgV',
        },
      },
    },
    builderCampaignBanner: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: '2wT4mlAKsjJ5IZmbBHObgV',
        },
      },
    },
  },
}

const mockCampaignEntry: ContentfulEntry<CampaignFields> = {
  metadata: {
    tags: [],
    concepts: [],
  },
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: 'ea2ybdmmn1kv',
      },
    },
    id: '1wljdcVnU32MZq9j5KY5jZ',
    type: 'Entry',
    createdAt: '2025-02-25T14:44:59.665Z',
    updatedAt: '2025-02-25T14:44:59.665Z',
    environment: {
      sys: {
        id: 'master',
        type: 'Link',
        linkType: 'Environment',
      },
    },
    publishedVersion: 18,
    revision: 1,
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: 'marketingCampaign',
      },
    },
  },
  fields: {
    name: {
      'en-US': 'Test Marketing Campaign',
      es: 'Campaña de marketing Test',
      zh: '测试营销活动',
    },
    marketplaceTabName: {
      'en-US': 'Test Tab',
      es: 'Prueba de pestaña',
      zh: '测试标签',
    },
    mainTag: {
      'en-US': 'TestTag',
    },
    additionalTags: {
      'en-US': ['TestTag1', 'TestTag2'],
    },
  },
}

const mockHomepageBannerEntry: ContentfulEntry<BannerFields> = {
  metadata: {
    tags: [],
    concepts: [],
  },
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: 'ea2ybdmmn1kv',
      },
    },
    id: '2wT4mlAKsjJ5IZmbBHObgV',
    type: 'Entry',
    createdAt: '2025-02-20T15:56:44.523Z',
    updatedAt: '2025-02-24T17:29:17.938Z',
    environment: {
      sys: {
        id: 'master',
        type: 'Link',
        linkType: 'Environment',
      },
    },
    publishedVersion: 23,
    revision: 4,
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: 'banner',
      },
    },
  },
  fields: {
    desktopTitle: {
      'en-US': 'Get ready to publish your wearables with the MFV tag!',
      es: '¡Prepárate para publicar tus wearables con la etiqueta MFV!',
      zh: '¡Prepárate para publicar tus wearables con la etiqueta MFV!',
    },
    desktopTitleAlignment: {
      'en-US': 'Left',
    },
    mobileTitle: {
      'en-US': 'Create for Decentraland Music Festival!',
      es: '¡Crea para el Festival de Música Decentraland!',
      zh: '¡Crea para el Festival de Música Decentraland!',
    },
    mobileTitleAlignment: {
      'en-US': 'Left',
    },
    desktopText: {
      'en-US': {
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {},
                marks: [],
                value:
                  "Add the MVF tag for your space-themed Wearables and Emotes and they'll be featured in a special Festival Tab on the Marketplace!",
                nodeType: 'text',
              },
            ],
            nodeType: 'paragraph',
          },
        ],
        nodeType: 'document',
      },
      es: {
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {},
                marks: [],
                value:
                  '¡Agrega la etiqueta MVF a tus wearables y emoticones con temática espacial y aparecerán en una pestaña especial del Festival en el Marketplace!',
                nodeType: 'text',
              },
            ],
            nodeType: 'paragraph',
          },
        ],
        nodeType: 'document',
      },
      zh: {
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {},
                marks: [],
                value:
                  '¡Agrega la etiqueta MVF a tus wearables y emoticones con temática espacial y aparecerán en una pestaña especial del Festival en el Marketplace!',
                nodeType: 'text',
              },
            ],
            nodeType: 'paragraph',
          },
        ],
        nodeType: 'document',
      },
    },
    desktopTextAlignment: {
      'en-US': 'Left',
    },
    mobileText: {
      'en-US': {
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {},
                marks: [],
                value:
                  '¡Agrega la etiqueta MVF a tus wearables y emoticones con temática espacial y aparecerán en una pestaña especial del Festival en el Marketplace!',
                nodeType: 'text',
              },
            ],
            nodeType: 'paragraph',
          },
        ],
        nodeType: 'document',
      },
      es: {
        nodeType: 'document',
        data: {},
        content: [
          {
            nodeType: 'paragraph',
            data: {},
            content: [
              {
                nodeType: 'text',
                value:
                  '¡Agrega la etiqueta MVF a tus wearables y emoticones con temática espacial y aparecerán en una pestaña especial del Festival en el Marketplace!',
                marks: [],
                data: {},
              },
            ],
          },
        ],
      },
      zh: {
        data: {},
        content: [
          {
            data: {},
            content: [
              {
                data: {},
                marks: [],
                value:
                  '¡Agrega la etiqueta MVF a tus wearables y emoticones con temática espacial y aparecerán en una pestaña especial del Festival en el Marketplace!',
                nodeType: 'text',
              },
            ],
            nodeType: 'paragraph',
          },
        ],
        nodeType: 'document',
      },
    },
    mobileTextAlignment: {
      'en-US': 'Left',
    },
    showButton: {
      'en-US': false,
    },
    desktopButtonAlignment: {
      'en-US': 'Left',
    },
    mobileButtonAlignment: {
      'en-US': 'Center',
    },
    fullSizeBackground: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: '5XKf4HY4MRWv2fzZD8lXoK',
        },
      },
    },
    mobileBackground: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: '5YhMhFL4mjaGvFryUCET2b',
        },
      },
    },
  },
}

const marketplaceHomepageBannerAssets: ContentfulAsset[] = [
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    fields: {
      title: {
        'en-US': 'Marketplace Banner Full Background Test',
      },
      description: {
        'en-US': '',
      },
      file: {
        'en-US': {
          url: 'https://cms-images.decentraland.org/ea2ybdmmn1kv/5XKf4HY4MRWv2fzZD8lXoK/7bf434e90b6115c5394ab13eec5583f9/static-1920-300.jpg',
          details: {
            size: 117325,
            image: {
              width: 1920,
              height: 300,
            },
          },
          fileName: 'static-1920-300.jpg',
          contentType: 'image/jpeg',
        },
      },
    },
    sys: {
      type: 'Asset',
      id: '5XKf4HY4MRWv2fzZD8lXoK',
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: 'ea2ybdmmn1kv',
        },
      },
      environment: {
        sys: {
          id: 'master',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      revision: 1,
      createdAt: '2025-02-20T15:55:35.975Z',
      updatedAt: '2025-02-20T15:55:35.975Z',
      publishedVersion: 4,
    },
  },
  {
    metadata: {
      tags: [],
      concepts: [],
    },
    sys: {
      type: 'Asset',
      id: '5YhMhFL4mjaGvFryUCET2b',
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: 'ea2ybdmmn1kv',
        },
      },
      environment: {
        sys: {
          id: 'master',
          type: 'Link',
          linkType: 'Environment',
        },
      },
      revision: 1,
      createdAt: '2025-02-20T15:56:36.934Z',
      updatedAt: '2025-02-20T15:56:36.934Z',
      publishedVersion: 4,
    },
    fields: {
      title: {
        'en-US': 'Marketplace Mobile Banner Test',
      },
      description: {
        'en-US': '',
      },
      file: {
        'en-US': {
          url: 'https://cms-images.decentraland.org/ea2ybdmmn1kv/5YhMhFL4mjaGvFryUCET2b/3b3955fb6518b3523ea766e305f30f8e/Marketplace_Mobile_Banner_Test.jpg',
          details: {
            size: 39941,
            image: {
              width: 400,
              height: 400,
            },
          },
          fileName: 'Marketplace Mobile Banner Test.jpg',
          contentType: 'image/jpeg',
        },
      },
    },
  },
]

export {
  mockAdminEntryEn,
  mockAdminEntry,
  mockCampaignEntry,
  mockHomepageBannerEntry,
  marketplaceHomepageBannerAssets,
}

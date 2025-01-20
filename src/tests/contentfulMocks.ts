import {
  ContentfulAsset,
  ContentfulEntry,
  MarketingAdminFields,
  CampaignFields,
  BannerFields
} from '@dcl/schemas'

const mockAdminEntry: ContentfulEntry<MarketingAdminFields> = {
  metadata: {
    tags: [],
    concepts: []
  },
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: 'ea2ybdmmn1kv'
      }
    },
    id: '3mvjCEsGUUqL22BY1vZLmZ',
    type: 'Entry',
    createdAt: '2025-01-14T19:01:37.139Z',
    updatedAt: '2025-01-17T13:10:03.829Z',
    environment: {
      sys: {
        id: 'development',
        type: 'Link',
        linkType: 'Environment'
      }
    },
    publishedVersion: 14,
    revision: 3,
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: 'admin'
      }
    }
  },
  fields: {
    name: {
      'en-US': 'Unique admin entity'
    },
    campaign: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: '7luqOR5Qdl8siwdQ8hscEW'
        }
      }
    },
    marketplaceHomepageBanner: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: '2maJ4UuoqaYtbZxVGymsJo'
        }
      }
    }
  }
}

const mockCampaignEntry: ContentfulEntry<CampaignFields> = {
  metadata: {
    tags: [],
    concepts: []
  },
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: 'ea2ybdmmn1kv'
      }
    },
    id: '7luqOR5Qdl8siwdQ8hscEW',
    type: 'Entry',
    createdAt: '2025-01-14T17:04:54.159Z',
    updatedAt: '2025-01-20T14:39:39.699Z',
    environment: {
      sys: {
        id: 'development',
        type: 'Link',
        linkType: 'Environment'
      }
    },
    publishedVersion: 24,
    revision: 7,
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: 'marketingCampaign'
      }
    }
  },
  fields: {
    name: {
      'en-US': 'Metaverse Festival 2024',
      es: 'Festival del metaverso 2024',
      zh: '2024 年元宇宙节'
    },
    marketplaceTabName: {
      'en-US': 'MVF2024',
      es: 'MVF2024',
      zh: 'MVF2024'
    },
    mainTag: {
      'en-US': 'MVF2024'
    }
  }
}

const mockHomepageBannerEntry: ContentfulEntry<BannerFields> = {
  metadata: {
    tags: [],
    concepts: []
  },
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: 'ea2ybdmmn1kv'
      }
    },
    id: '2maJ4UuoqaYtbZxVGymsJo',
    type: 'Entry',
    createdAt: '2025-01-07T18:43:08.572Z',
    updatedAt: '2025-01-15T17:23:51.474Z',
    environment: {
      sys: {
        id: 'development',
        type: 'Link',
        linkType: 'Environment'
      }
    },
    publishedVersion: 50,
    revision: 12,
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: 'banner'
      }
    }
  },
  fields: {
    desktopTitle: {
      'en-US': 'Prepare Your Galactic Looks!',
      es: 'Prepara tus looks galácticos!',
      zh: '准备好你的银河外观！'
    },
    desktopTitleAlignment: {
      'en-US': 'Left'
    },
    mobileTitle: {
      'en-US': 'Prepare Your Galactic Looks!',
      es: 'Prepara tus looks galácticos!',
      zh: '准备好你的银河外观！'
    },
    mobileTitleAlignment: {
      'en-US': 'Center'
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
                  "Get ready to show off your out of this world style at this year's music festival ",
                nodeType: 'text'
              },
              {
                data: {},
                marks: [
                  {
                    type: 'bold'
                  }
                ],
                value: 'Nov 20-23',
                nodeType: 'text'
              },
              {
                data: {},
                marks: [],
                value: '!',
                nodeType: 'text'
              }
            ],
            nodeType: 'paragraph'
          },
          {
            data: {},
            content: [
              {
                data: {},
                marks: [],
                value: 'Use the ',
                nodeType: 'text'
              },
              {
                data: {},
                marks: [
                  {
                    type: 'italic'
                  }
                ],
                value: 'DCLMF24',
                nodeType: 'text'
              },
              {
                data: {},
                marks: [],
                value:
                  ' tab to find everything you will need to be festival ready all in ',
                nodeType: 'text'
              },
              {
                data: {},
                marks: [
                  {
                    type: 'underline'
                  }
                ],
                value: 'one place',
                nodeType: 'text'
              },
              {
                data: {},
                marks: [],
                value: '.',
                nodeType: 'text'
              }
            ],
            nodeType: 'paragraph'
          }
        ],
        nodeType: 'document'
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
                  '¡Prepárate para mostrar tu estilo fuera de lo común en el festival de música de este año, que se realizará del 20 al 23 de noviembre!',
                marks: [],
                data: {}
              }
            ]
          },
          {
            nodeType: 'paragraph',
            data: {},
            content: [
              {
                nodeType: 'text',
                value:
                  'Usa la pestaña DCLMF24 para encontrar todo lo que necesitas para estar listo para el festival, todo en un solo lugar.',
                marks: [],
                data: {}
              }
            ]
          }
        ]
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
                  '准备好在 11 月 20 日至 23 日举行的今年音乐节上展示您非凡的风格吧！使用 DCLMF24 选项卡，在一个地方找到您参加音乐节所需的一切。',
                nodeType: 'text'
              }
            ],
            nodeType: 'paragraph'
          }
        ],
        nodeType: 'document'
      }
    },
    desktopTextAlignment: {
      'en-US': 'Left'
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
                  "Get ready to show off your out of this world style at this year's music festival ",
                nodeType: 'text'
              },
              {
                data: {},
                marks: [
                  {
                    type: 'bold'
                  }
                ],
                value: 'Nov 20-23',
                nodeType: 'text'
              },
              {
                data: {},
                marks: [],
                value: '!',
                nodeType: 'text'
              }
            ],
            nodeType: 'paragraph'
          }
        ],
        nodeType: 'document'
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
                  '¡Prepárate para mostrar tu estilo fuera de lo común en el festival de música de este año, que se realizará del 20 al 23 de noviembre!',
                nodeType: 'text'
              }
            ],
            nodeType: 'paragraph'
          }
        ],
        nodeType: 'document'
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
                  '准备好在 11 月 20 日至 23 日举行的今年音乐节上展示您非凡的风格吧！',
                nodeType: 'text'
              }
            ],
            nodeType: 'paragraph'
          }
        ],
        nodeType: 'document'
      }
    },
    mobileTextAlignment: {
      'en-US': 'Left'
    },
    showButton: {
      'en-US': true
    },
    buttonLink: {
      'en-US': 'https://google.com'
    },
    buttonsText: {
      'en-US': 'Shop now',
      es: 'Comprar ahora',
      zh: '立即购买'
    },
    desktopButtonAlignment: {
      'en-US': 'Left'
    },
    mobileButtonAlignment: {
      'en-US': 'Center'
    },
    fullSizeBackground: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: '6E1rR9gejaDnaXQbRPifFe'
        }
      }
    },
    mobileBackground: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: '4r6BTqYTzJViXYDhowTMJm'
        }
      }
    },
    logo: {
      'en-US': {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: '2fPc6zxkPEIJcI3jUBTdOo'
        }
      }
    }
  }
}

const marketplaceHomepageBannerAssets: ContentfulAsset[] = [
  {
    metadata: {
      tags: [],
      concepts: []
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: 'ea2ybdmmn1kv'
        }
      },
      id: '2fPc6zxkPEIJcI3jUBTdOo',
      type: 'Asset',
      createdAt: '2025-01-09T17:55:26.842Z',
      updatedAt: '2025-01-09T17:55:26.842Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment'
        }
      },
      publishedVersion: 5,
      revision: 1
    },
    fields: {
      title: {
        'en-US': 'Metarverse Festival 2024 Logo'
      },
      description: {
        'en-US': ''
      },
      file: {
        'en-US': {
          url:
            '//images.ctfassets.net/ea2ybdmmn1kv/2fPc6zxkPEIJcI3jUBTdOo/1454c71d341ff247c9563e3108e025ff/logo.webp',
          details: {
            size: 441546,
            image: {
              width: 960,
              height: 211
            }
          },
          fileName: 'logo.webp',
          contentType: 'image/webp'
        }
      }
    }
  },
  {
    metadata: {
      tags: [],
      concepts: []
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: 'ea2ybdmmn1kv'
        }
      },
      id: '4r6BTqYTzJViXYDhowTMJm',
      type: 'Asset',
      createdAt: '2025-01-07T18:41:30.547Z',
      updatedAt: '2025-01-07T18:41:30.547Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment'
        }
      },
      publishedVersion: 6,
      revision: 1
    },
    fields: {
      title: {
        'en-US': 'Marketplace Mobile Banner Test'
      },
      description: {
        'en-US': 'Marketplace mobile banner.'
      },
      file: {
        'en-US': {
          url:
            '//images.ctfassets.net/ea2ybdmmn1kv/4r6BTqYTzJViXYDhowTMJm/86510732bc7732625ad3581d4bd14eb3/static-390-390.jpg',
          details: {
            size: 44180,
            image: {
              width: 390,
              height: 390
            }
          },
          fileName: 'static-390-390.jpg',
          contentType: 'image/jpeg'
        }
      }
    }
  },
  {
    metadata: {
      tags: [],
      concepts: []
    },
    sys: {
      space: {
        sys: {
          type: 'Link',
          linkType: 'Space',
          id: 'ea2ybdmmn1kv'
        }
      },
      id: '6E1rR9gejaDnaXQbRPifFe',
      type: 'Asset',
      createdAt: '2025-01-07T18:39:55.992Z',
      updatedAt: '2025-01-07T18:39:55.992Z',
      environment: {
        sys: {
          id: 'development',
          type: 'Link',
          linkType: 'Environment'
        }
      },
      publishedVersion: 7,
      revision: 1
    },
    fields: {
      title: {
        'en-US': 'Marketplace Banner Full Background Test'
      },
      description: {
        'en-US': ''
      },
      file: {
        'en-US': {
          url:
            '//images.ctfassets.net/ea2ybdmmn1kv/6E1rR9gejaDnaXQbRPifFe/7638d286960c0269125543c23faf8312/static-1920-300.jpg',
          details: {
            size: 117325,
            image: {
              width: 1920,
              height: 300
            }
          },
          fileName: 'static-1920-300.jpg',
          contentType: 'image/jpeg'
        }
      }
    }
  }
]

export {
  mockAdminEntry,
  mockHomepageBannerEntry,
  mockCampaignEntry,
  marketplaceHomepageBannerAssets
}

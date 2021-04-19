import * as contentHash from 'content-hash'
const MemoryDatastore = require('interface-datastore').MemoryDatastore
import pull from 'pull-stream'
const Importer = require('ipfs-unixfs-engine').Importer
import toBuffer from 'blob-to-buffer'
import CID from 'cids'

import { t } from '../modules/translation/utils'

const INDEX_FILE_PATH = 'index.html'

type ContentServiceFile = {
  path: string
  content: Buffer
  size: number
}

function makeContentFile(
  path: string,
  content: string | Blob
): Promise<ContentServiceFile> {
  return new Promise((resolve, reject) => {
    if (typeof content === 'string') {
      const buffer = Buffer.from(content)
      resolve({ path, content: buffer, size: Buffer.byteLength(buffer) })
    } else if (content instanceof Blob) {
      toBuffer(content, (err: Error, buffer: Buffer) => {
        if (err) reject(err)
        resolve({ path, content: buffer, size: Buffer.byteLength(buffer) })
      })
    } else {
      reject(
        new Error(
          'Unable to create ContentFile: content must be a string or a Blob'
        )
      )
    }
  })
}

async function getCID(
  files: ContentServiceFile[],
  shareRoot: boolean
): Promise<string> {
  const importer = new Importer(new MemoryDatastore(), { onlyHash: true })
  return new Promise<string>((resolve, reject) => {
    pull(
      pull.values(files),
      pull.asyncMap((file: ContentServiceFile, cb: any) => {
        const data = {
          path: shareRoot ? '/tmp/' + file.path : file.path,
          content: file.content
        }
        cb(null, data)
      }),
      importer,
      pull.onEnd(() => {
        return importer.flush((err: any, content: any) => {
          if (err) {
            reject(err)
          }
          resolve(new CID(content).toBaseEncodedString())
        })
      })
    )
  })
}

export async function blobToCID(blob: Blob, path: string) {
  const file = await makeContentFile(path, blob)
  const cid = await getCID([file], false)
  return cid
}

const coordsToId = (x: string | number, y: string | number) => x + ', ' + y

const getCenter = (selection: { x: number; y: number }[]) => {
  const xs = [...new Set(selection.map(coords => coords.x).sort())]
  const ys = [...new Set(selection.map(coords => coords.y).sort())]
  const x = xs[(xs.length / 2) | 0]
  const y = ys[(ys.length / 2) | 0]
  return [x, y]
}

enum LandType {
  PARCEL = 'parcel',
  ESTATE = 'estate'
}

const getSelection = (land: any) =>
  land.type === LandType.PARCEL
    ? [{ x: land.x, y: land.y }]
    : land.parcels.map((parcel: any) => ({ x: parcel.x, y: parcel.y }))

export class IpfsAPI {
  landPosition: string
  ipfsUrl: string

  constructor(landPosition: string, ipfsUrl: string) {
    this.landPosition = landPosition
    this.ipfsUrl = ipfsUrl
  }

  generateRedirectionFile = (land: any): Blob => {
    const selection = getSelection(land)
    const [x, y] = getCenter(selection)

    const html: string = `<html>
    <head>
      <meta
        http-equiv="refresh"
        content="0; URL=${this.landPosition}${coordsToId(x, y)}"
      />
    </head>
    <body>
      <p>
        ${t('ipfs_api.not_redirected')}
        <a href="${this.landPosition}${coordsToId(x, y)}">
          ${t('global.click_here')}
        </a>.
      </p>
    </body>
    </html>`

    return new Blob([html])
  }

  uploadRedirectionFile = async (land: any): Promise<string> => {
    const formData = new FormData()
    const blob = this.generateRedirectionFile(land)
    formData.append('blob', blob, INDEX_FILE_PATH)
    const result = await fetch(this.ipfsUrl, {
      method: 'POST',
      body: formData
    })
    const json = await result.json()
    return json.Hash
  }

  computeLandHash = async (land: any) => {
    const blob = this.generateRedirectionFile(land)
    const ipfsHash = await blobToCID(blob, INDEX_FILE_PATH)
    const hash = await contentHash.fromIpfs(ipfsHash)
    return hash
  }
}

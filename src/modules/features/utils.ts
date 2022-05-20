import { ApplicationName, ApplicationFeatures } from './types'

export const fetchApplicationFeatures = async (apps: ApplicationName[]) => {
  const promises = apps.map(a => fetchSingleApplicationFeatures(a))
  const features = await Promise.all(promises)

  return features.reduce((acc, feature) => {
    acc[feature.name] = feature
    return acc
  }, {} as Record<ApplicationName, ApplicationFeatures>)
}

const fetchSingleApplicationFeatures = async (
  app: ApplicationName
): Promise<ApplicationFeatures> => {
  const url = `https://feature-flags.decentraland.org/${app}.json`
  const response = await fetch(url)
  const json = await response.json()

  return {
    name: app,
    flags: json.flags,
    variants: json.variants
  }
}

import { Applications, Feature } from './types'

export const fetchFeaturesDelay = 10000

export const fetchFeatures = async (applications: Applications[]) => {
  const promises = applications.map(a => fetchFeature(a))
  const features = await Promise.all(promises)

  return features.reduce((acc, feature) => {
    acc[feature.application] = feature
    return acc
  }, {} as Record<Applications, Feature>)
}

const fetchFeature = async (application: Applications): Promise<Feature> => {
  const response = await fetch(
    `https://feature-flags.decentraland.org/${application}.json`
  )

  const json = await response.json()

  return {
    application,
    flags: json.flags,
    variants: json.variants
  }
}

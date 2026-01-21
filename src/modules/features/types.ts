import { FeaturesState } from "./reducer";

export type Payload = {
  type: string;
  value: string;
};

export type Variant = {
  name: string;
  payload: Payload;
  enabled: boolean;
};

export type ApplicationFeatures = {
  name: ApplicationName;
  flags: Record<string, boolean>;
  variants: Record<string, Variant>;
};

export enum ApplicationName {
  EXPLORER = "explorer",
  PROFILE = "profile",
  BUILDER = "builder",
  MARKETPLACE = "marketplace",
  ACCOUNT = "account",
  DAO = "dao",
  EVENTS = "events",
  LANDING = "landing",
  DAPPS = "dapps",
  TEST = "test",
}

export type Polling = {
  apps: ApplicationName[];
  delay: number;
};

export type FeatureSagasConfig = {
  polling?: Polling;
};

export type StateWithFeatures = {
  // Possibly undefined because clients might not have implemented the features module into their dapps.
  // This allows us to check that before operating on it.
  features?: FeaturesState;
};

// Make sure that in order to handle these, the client has to fetch ApplicationName.DAPPS feature flags.
export enum FeatureName {
  MAGIC_AUTO_SIGN = "magic-auto-sign",
  CREDITS = "credits",
  USER_WALLETS = "alfa-marketplace-credits",
  LAUNCHER_LINKS = "launcher-links",
  DOWNLOAD_IN_SUCCESS_PAGE = "download-in-success-page",
}

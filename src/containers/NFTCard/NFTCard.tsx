import { Network, WearableCategory } from "@dcl/schemas";
import { NFTCard as NFTCardUI } from "decentraland-ui/dist/components/NFTCard/NFTCard";
import { t } from "../../modules/translation/utils";
import { NFTCardProps } from "./NFTCard.types";

export const NFTCard = (props: NFTCardProps) => {
  const i18n = {
    network: {
      [Network.ETHEREUM]: "Ethereum",
      [Network.MATIC]: "Polygon",
    },
    bodyShape: {
      male: t("@dapps.nft_card.body_shape.male"),
      female: t("@dapps.nft_card.body_shape.female"),
      unisex: t("@dapps.nft_card.body_shape.unisex"),
    },
    playMode: {
      loop: t("@dapps.nft_card.play_mode.loop"),
      once: t("@dapps.nft_card.play_mode.once"),
    },
    category: {
      [WearableCategory.EYEBROWS]: t("@dapps.nft_card.category.eyebrows"),
      [WearableCategory.EYES]: t("@dapps.nft_card.category.eyes"),
      [WearableCategory.FACIAL_HAIR]: t("@dapps.nft_card.category.facial_hair"),
      [WearableCategory.HAIR]: t("@dapps.nft_card.category.hair"),
      [WearableCategory.BODY_SHAPE]: t("@dapps.nft_card.category.body_shape"),
      [WearableCategory.MOUTH]: t("@dapps.nft_card.category.mouth"),
      [WearableCategory.UPPER_BODY]: t("@dapps.nft_card.category.upper_body"),
      [WearableCategory.LOWER_BODY]: t("@dapps.nft_card.category.lower_body"),
      [WearableCategory.FEET]: t("@dapps.nft_card.category.feet"),
      [WearableCategory.EARRING]: t("@dapps.nft_card.category.earring"),
      [WearableCategory.EYEWEAR]: t("@dapps.nft_card.category.eyewear"),
      [WearableCategory.HAT]: t("@dapps.nft_card.category.hat"),
      [WearableCategory.HELMET]: t("@dapps.nft_card.category.helmet"),
      [WearableCategory.MASK]: t("@dapps.nft_card.category.mask"),
      [WearableCategory.TIARA]: t("@dapps.nft_card.category.tiara"),
      [WearableCategory.TOP_HEAD]: t("@dapps.nft_card.category.top_head"),
      [WearableCategory.SKIN]: t("@dapps.nft_card.category.skin"),
      [WearableCategory.HANDS_WEAR]: t("@dapps.nft_card.category.hands_wear"),
    },
    withSound: t("@dapps.nft_card.with_sound"),
    smart: t("@dapps.nft_card.smart"),
    social: t("@dapps.nft_card.social"),
  };

  return <NFTCardUI i18n={i18n} {...props} />;
};

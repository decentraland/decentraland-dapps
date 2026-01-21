import React from "react";
import { Rarity } from "@dcl/schemas";
import { RarityBadge as UIRarityBadge } from "decentraland-ui/dist/components/RarityBadge";
import { t } from "../../modules/translation";
import { RarityBadgeProps } from "./RarityBadge.types";

const RarityBadge = (props: RarityBadgeProps) => {
  const i18n = {
    rarities: {
      [Rarity.COMMON]: t("@dapps.rarities.common"),
      [Rarity.UNCOMMON]: t("@dapps.rarities.uncommon"),
      [Rarity.EXOTIC]: t("@dapps.rarities.exotic"),
      [Rarity.RARE]: t("@dapps.rarities.rare"),
      [Rarity.EPIC]: t("@dapps.rarities.epic"),
      [Rarity.LEGENDARY]: t("@dapps.rarities.legendary"),
      [Rarity.MYTHIC]: t("@dapps.rarities.mythic"),
      [Rarity.UNIQUE]: t("@dapps.rarities.unique"),
    },
    rarities_description: {
      [Rarity.COMMON]: t("@dapps.rarities_description.common"),
      [Rarity.UNCOMMON]: t("@dapps.rarities_description.uncommon"),
      [Rarity.EXOTIC]: t("@dapps.rarities_description.exotic"),
      [Rarity.RARE]: t("@dapps.rarities_description.rare"),
      [Rarity.EPIC]: t("@dapps.rarities_description.epic"),
      [Rarity.LEGENDARY]: t("@dapps.rarities_description.legendary"),
      [Rarity.MYTHIC]: t("@dapps.rarities_description.mythic"),
      [Rarity.UNIQUE]: t("@dapps.rarities_description.unique"),
    },
  };

  return <UIRarityBadge {...props} i18n={i18n} />;
};

export default React.memo(RarityBadge);

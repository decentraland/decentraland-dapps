import { Network } from "@dcl/schemas/dist/dapps/network";
import { ButtonProps } from "decentraland-ui/dist/components/Button/Button";

export type Props = ButtonProps & {
  network: Network;
};

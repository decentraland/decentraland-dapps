import { ToastProps } from "decentraland-ui/dist/components/Toast/Toast";
import { ToastPosition } from "decentraland-ui";

export type Toast = { id: number; position?: ToastPosition } & ToastProps;

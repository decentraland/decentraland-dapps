import { closeModal } from "../../modules/modal/actions";
import { ModalState } from "../../modules/modal/reducer";

export type ModalProps = {
  name: string;
  metadata?: any;
  onClose: () => ReturnType<typeof closeModal>;
};
export type ModalComponent = React.ComponentType<ModalProps>;

export type DefaultProps = {
  children: React.ReactNode;
};

export type Props = DefaultProps & {
  components: Record<string, ModalComponent>;
  modals: ModalState;
  onClose: typeof closeModal;
};

export type MapStateProps = Pick<Props, "modals">;
export type MapDispatchProps = Pick<Props, "onClose">;

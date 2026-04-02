import { Modal } from '@/components/Modal';

interface Props {
  message: string | null;
  onDismiss: () => void;
}

export function ErrorModal({ message, onDismiss }: Props) {
  return (
    <Modal
      visible={!!message}
      title="오류"
      body={message ?? ''}
      variant="single"
      confirmLabel="확인"
      onConfirm={onDismiss}
      onDismiss={onDismiss}
    />
  );
}

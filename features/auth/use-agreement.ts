import { useCallback, useRef, useState } from 'react';
import { hasAgreed, saveAgreement } from '@/features/auth/lib/agreement';

export function useAgreement() {
  const [modalVisible, setModalVisible] = useState(false);
  const pendingActionRef = useRef<(() => Promise<void>) | null>(null);

  const requireAgreement = useCallback(async (action: () => Promise<void>) => {
    const agreed = await hasAgreed();
    if (agreed) {
      await action();
    } else {
      pendingActionRef.current = action;
      setModalVisible(true);
    }
  }, []);

  const onAgree = useCallback(async () => {
    await saveAgreement();
    setModalVisible(false);
    if (pendingActionRef.current) {
      await pendingActionRef.current();
      pendingActionRef.current = null;
    }
  }, []);

  const onDismiss = useCallback(() => {
    setModalVisible(false);
    pendingActionRef.current = null;
  }, []);

  return { requireAgreement, modalVisible, onAgree, onDismiss };
}

'use client';

import DeleteButton from '@/components/DeleteButton';

export default function GridDeleteCell({ id, action }: { id: number; action: (formData: FormData) => Promise<void> }) {
  return <DeleteButton action={action} id={id} />;
}

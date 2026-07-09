'use client';

export default function DeleteButton({ action, id }: { action: (formData: FormData) => Promise<void>; id: number }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm('Устгах уу?')) e.preventDefault(); }}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn-danger">Устгах</button>
    </form>
  );
}

export default function Alert({ message }: { message?: string | null }) {
  if (!message) return null;
  const isError = /алдаа|хүрэлцэхгүй|буруу|олдсонгүй|боломжгүй|хоосон|оруулна/i.test(message);
  return (
    <div className={`mb-4 rounded px-4 py-2 text-sm ${isError ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-green-200 bg-green-50 text-green-700'}`}>
      {message}
    </div>
  );
}

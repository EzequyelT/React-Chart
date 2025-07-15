export default function StatusBadge({ status }) {
  const statusColors = {
    online: 'green',
    offline: 'gray',
    remoto: 'blue',
  };

  const color = statusColors[status] || 'gray';

  return (
    <div className="flex items-center gap-2 animate-pulse">
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
        }}
      />
      <span className="text-sm text-gray-700">{status}</span>
    </div>
  );
}

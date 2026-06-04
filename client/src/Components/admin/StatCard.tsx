// components/admin/StatCard.tsx
export default function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center border">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold text-green-800">{value}</h2>
      </div>
      <div className="text-green-600">{icon}</div>
    </div>
  );
}
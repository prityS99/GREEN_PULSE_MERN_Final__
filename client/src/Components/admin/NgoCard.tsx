// components/admin/NgoCard.tsx

export default function NgoCard({ ngo }: any) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm relative">
      
      {ngo.govtReward && (
        <span className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
          Govt Reward
        </span>
      )}

      {ngo.verified && (
        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
          Verified NGO
        </span>
      )}

      <h2 className="text-lg font-bold text-green-900">{ngo.ngoName}</h2>
      <p className="text-sm text-gray-600">{ngo.about}</p>

      <button className="mt-3 bg-green-600 text-white px-3 py-1 rounded">
        Approve NGO
      </button>
    </div>
  );
}
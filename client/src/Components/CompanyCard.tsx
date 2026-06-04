import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Users,
  Award,
  ShieldCheck,
  Star,
  Briefcase,
} from "lucide-react";
import { CleaningCompany } from "../../src/app/cleaning-company/page";

interface Props {
  company?: CleaningCompany;
}

export default function CompanyCard({ company }: Props) {
  if (!company) {
    return null;
  }

  return (
    <div className="group overflow-hidden rounded-3xl border border-white/10 bg-[#0d1e16] hover:border-emerald-500/30 transition-all duration-300 shadow-xl">
      {/* Cover Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={company.coverImage?.url || "/placeholder-company.jpg"}
          alt={company.companyName || "Company"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              company.isApproved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
            }`}
          >
            {company.isApproved ? "Verified" : "Pending"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 text-white">
        <h2 className="text-2xl font-black mb-2">
          {company.companyName}
        </h2>

        <p className="text-gray-400 text-sm leading-relaxed mb-5">
          {company.about?.length > 120
            ? `${company.about.slice(0, 120)}...`
            : company.about}
        </p>

        {/* Details */}
        <div className="space-y-3 text-sm mb-6">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={16} className="text-emerald-400" />
            {company.city || "N/A"}, {company.state || "N/A"}
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Phone size={16} className="text-emerald-400" />
            {company.phone || "N/A"}
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Users size={16} className="text-emerald-400" />
            {company.workersCount || 0} Workers
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <Briefcase size={16} className="text-emerald-400" />
            {company.experienceYears || 0} Years Experience
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl bg-black/30 border border-white/10 p-3 text-center">
            <Award className="mx-auto text-yellow-400 mb-2" size={18} />
            <h4 className="font-black text-lg">
              {company.completedProjects || 0}
            </h4>
            <p className="text-xs text-gray-400">Projects</p>
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/10 p-3 text-center">
            <Star className="mx-auto text-emerald-400 mb-2" size={18} />
            <h4 className="font-black text-lg">
              {company.totalReviews || 0}
            </h4>
            <p className="text-xs text-gray-400">Reviews</p>
          </div>

          <div className="rounded-2xl bg-black/30 border border-white/10 p-3 text-center">
            <ShieldCheck className="mx-auto text-blue-400 mb-2" size={18} />
            <h4 className="font-black text-lg">
              {company.points || 0}
            </h4>
            <p className="text-xs text-gray-400">Points</p>
          </div>
        </div>

        {/* Owner */}
        <div className="border-t border-white/10 pt-4 mb-5">
          <p className="text-sm text-gray-400">Owner</p>

          <p className="font-semibold text-white">
            {company.ownerName || "N/A"}
          </p>

          <p className="text-sm text-gray-500">
            {company.ownerEmail || "N/A"}
          </p>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/cleaning-company/${company._id}`}>
            <button className="w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-semibold">
              View Details
            </button>
          </Link>

          <Link href={`/hire-service/${company._id}`}>
            <button className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition text-white font-bold">
              Hire Service
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Loader2, Building2, Globe, MapPin, Mail, User } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { ngoService } from "@/services/api";

export interface CoverImage {
  url: string;
  coverImageId: string;
}

export interface NGO {
  _id: string;
  ngoName: string;
  about?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  ngoType?: string[];
  isApproved?: boolean;
  createdAt?: string;
  coverImage?: CoverImage;
  ownerName?: string;  // Added back to reflect cleaning company structure
  ownerEmail?: string; // Added back to reflect cleaning company structure
  userId?: {
    name?: string;
    email?: string;
    profileImage?: {
      public_id?: string;
      url: string;
    };
  };
}

// Staggered layout configuration
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Frame entry movement
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 14,
    },
  },
};

export default function NGODirectory() {
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNGOs();
  }, []);

  const loadNGOs = async () => {
    try {
      setLoading(true);
      const res = await ngoService.getAllNgo();
      console.log("NGO API Response:", res);
      setNgos(res?.data || []);
    } catch (error) {
      console.error("Failed to load NGOs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07130d]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07130d] text-white overflow-x-hidden">
      {/* Header Section */}
      <section className="pt-28 pb-16 px-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 rounded-full mb-6">
            <Globe className="text-emerald-400" size={18} />
            <span className="text-emerald-400 font-semibold">
              NGOs & Non-Profits Directory
            </span>
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-6xl font-black mb-5"
          >
            Support Noble Causes
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            Browse verified Non-Governmental Organizations, explore their core focus areas, locations, and join hands to make an impact.
          </motion.p>
        </motion.div>
      </section>

      {/* Grid Content Section */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {ngos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 border border-dashed border-white/10 rounded-3xl"
          >
            <Building2 size={60} className="mx-auto text-gray-500 mb-4" />
            <h2 className="text-2xl font-bold">No NGOs Available</h2>
            <p className="text-gray-400 mt-3">
              There are currently no registered NGOs found.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold">
                Available NGOs ({ngos.length})
              </h2>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.05 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {ngos.map((ngo) => (
                <NGOCard key={ngo._id} ngo={ngo} />
              ))}
            </motion.div>
          </>
        )}
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SUB-COMPONENT: NGO CARD WITH FOUNDER INFO                                  */
/* -------------------------------------------------------------------------- */
function NGOCard({ ngo }: { ngo: NGO }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultCoverImage = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop";
  const defaultProfileImage = "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=200&auto=format&fit=crop"; 
  
  const aboutText = ngo.about || "No description provided.";
  const shouldTruncate = aboutText.length > 120;
  const displayedText = shouldTruncate && !isExpanded 
    ? `${aboutText.slice(0, 120)}...` 
    : aboutText;

  // Reading safely from the newly typed backend population path
  const founderName = ngo.ownerName || ngo.userId?.name || "Unknown Founder";
  const founderEmail = ngo.ownerEmail || ngo.userId?.email || "No email available";
  const founderAvatar = ngo.userId?.profileImage?.url || defaultProfileImage;

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -6, scale: 1.01 }}
      className="bg-[#0b1e15] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between transition-colors duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/20 group h-full"
    >
      <div>
        {/* Cover Image Feature */}
        <div className="h-48 w-full relative overflow-hidden bg-emerald-950/50">
          <img
            src={ngo.coverImage?.url || defaultCoverImage}
            alt={`${ngo.ngoName} cover`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Content Area */}
        <div className="p-6 pb-0">
          {/* Founder Header Details */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={founderAvatar}
              alt={founderName}
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
            <div className="overflow-hidden max-w-full">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <User size={12} className="text-emerald-500" /> Founder / Representative
              </p>
              <p className="text-sm font-semibold text-gray-200 truncate">
                {founderName}
              </p>
            </div>
          </div>

          {/* NGO Title */}
          <h3 className="text-xl font-bold text-white tracking-tight mb-2">
            {ngo.ngoName}
          </h3>

          {/* Badges / Types */}
          {ngo.ngoType && ngo.ngoType.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {ngo.ngoType.map((type, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase font-bold tracking-wide"
                >
                  {type}
                </span>
              ))}
            </div>
          )}

          {/* About Copy with Read More Control */}
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            {displayedText}
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-emerald-400 hover:text-emerald-300 ml-1.5 font-semibold text-xs inline-block align-baseline focus:outline-none"
              >
                {isExpanded ? "Read Less" : "Read More"}
              </button>
            )}
          </p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mx-6 mb-6 pt-4 border-t border-white/5 flex flex-col gap-2.5 text-xs text-gray-400">
        {/* Founder Email */}
        <div className="flex items-center gap-2 text-gray-400">
          <Mail size={14} className="text-emerald-500 shrink-0" />
          <span className="truncate hover:text-emerald-400 transition-colors">
            {founderEmail}
          </span>
        </div>

        {/* Location Info */}
        <div className="flex items-start gap-2">
          <MapPin size={14} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            {ngo.address && <p className="mb-0.5">{ngo.address}</p>}
            <p className="font-medium text-gray-300">
              {[ngo.city, ngo.state, ngo.country].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
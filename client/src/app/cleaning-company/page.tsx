"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader2, Building2, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import Link from "next/link"; // Added Link for Next.js navigation
import CompanyCard from "../../Components/CompanyCard";
import { cleaningCompanyService } from "@/services/api";
import { motion, Variants } from "framer-motion";
import toast from "react-hot-toast";

export interface CoverImage {
  url: string;
  coverImageId: string;
}

export interface CleaningCompany {
  _id: string;
  userId: string;
  companyName: string;
  about: string;
  licenseNumber: string;
  workersCount: number;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  experienceYears: number;
  completedProjects: number;
  points: number;
  totalReviews: number;
  isApproved: boolean;
  coverImage?: CoverImage;
  ownerName?: string;
  ownerEmail?: string;
  ownerImage?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
};

export default function CleaningCompanyPage() {
  const [companies, setCompanies] = useState<CleaningCompany[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const isFetchingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const res = await cleaningCompanyService.getAllCompanies();
      setCompanies(res?.data || []);
      
      if (res?.data && res.data.length > 0) {
        toast.dismiss(); 
        toast.success("Successfully loaded companies!", {
          id: "load-companies-success",
          duration: 1500,
        });
      }
    } catch (error) {
      console.error("Failed to load companies:", error);
      toast.dismiss();
      toast.error("Failed to fetch companies.", { id: "load-companies-error" });
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
    <div className="min-h-screen bg-[#07130d] text-white">
      <section className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center relative">
          
          {/* --- BACK TO HOME BUTTON --- */}
          <div className="flex justify-start mb-6 max-w-2xl mx-auto">
            <Link href="/">
              <motion.button
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors duration-200 font-medium text-sm bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/20 px-4 py-2 rounded-xl"
              >
                <ArrowLeft size={16} />
                Back to Home
              </motion.button>
            </Link>
          </div>
          {/* --------------------------- */}

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-5 py-2 rounded-full mb-6"
          >
            <Building2 className="text-emerald-400" size={18} />
            <span className="text-emerald-400 font-semibold">
              Cleaning Companies Directory
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-5"
          >
            Find Trusted Cleaning Services
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            Browse verified environmental cleaning companies, compare
            experience, workforce capacity, reviews, and hire the right team.
          </motion.p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        {companies.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 border border-dashed border-white/10 rounded-3xl"
          >
            <Building2 size={60} className="mx-auto text-gray-500 mb-4" />
            <h2 className="text-2xl font-bold">No Companies Available</h2>
            <p className="text-gray-400 mt-3">
              There are currently no registered cleaning companies.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold">
                Available Companies ({companies.length})
              </h2>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {companies.map((company) => (
                <motion.div 
                  key={company._id} 
                  variants={cardVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <CompanyCard company={company} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </section>
    </div>
  );
}
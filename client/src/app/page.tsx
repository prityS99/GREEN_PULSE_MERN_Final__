"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Leaf,
  Trees,
  PawPrint,
  Users,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Star,
  Images,
  Briefcase,
  Send,
  Building,
  CheckCircle,
  XCircle,
  Search,
  X,
  Award,
  MessageSquare,
  Zap,
  CheckSquare,
  Shield,
  Apple,
  ShieldAlert,
  Stethoscope,
  BookOpen,
  Laptop,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../Hooks/Redux/store";
import { clearErrors } from "../Hooks/Redux/Slices/authSlice";
import { cleaningCompanyService, ngoService } from "../services/api";
import { socket } from "@/lib/socket";

export interface Badge {
  _id: string;
  badgeName: string;
  badgeImage?: string;
  description?: string;
  badgeColor?: string;
  requiredPoints?: number;
  isActive?: boolean;
}

export interface LocalReview {
  name: string;
  review: string;
  rating: number;
}

export interface NGO {
  _id: string;
  ngoName: string;
  coverImage?: {
    url: string;
    coverImageId?: string;
  };
  about?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  ngoType?: string[];
  isApproved?: boolean;
  createdAt?: string;
  badges?: Badge[];
  localReviews?: LocalReview[];
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
  coverImage?: {
    url: string;
    coverImageId?: string;
  };
  ownerName?: string;
  ownerEmail?: string;
  ownerImage?: string;
}

interface IGlobalReview {
  name: string;
  review: string;
  rating: number;
}

const carouselSlides = [
  {
    image: "/hero1.jpg",
    title: "Building More Cleaner & More Greener Our Mother Earth",
    desc: "Green Pulse connects NGOs, volunteers, cleaning companies, and communities into one powerful eco-system.",
  },
  {
    image: "/hero2.jpg",
    title: "Restoring Nature, One Tree At A Time",
    desc: "Join our mega plantation drives across cities to revive urban ecosystems and breathe fresh air.",
  },
  {
    image: "/hero3.jpg",
    title: "Compassion In Action For Stray Life, They Also Deserve Better",
    desc: "Connecting animal rescuers and shelter spaces with dedicated logistics and critical supplies.",
  },
];

const menuItems = [
  { name: "Cleaning Companies", path: "/cleaning-company" },
  { name: "Campaigns", path: "/ngo/campaigns" },
  { name: "Tree Plantation", path: "/tree-plantation" },
  { name: "Donate", path: "/donation" },
];
const gallery = [
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=60&",
  "https://images.unsplash.com/photo-1616680214084-22670de1bc82?q=80&w=1170&auto=format&fit=crop&",
  "https://images.unsplash.com/photo-1652858672796-960164bd632b?q=80&w=1170&auto=format&fit=crop&",
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1609252509229-364936a1d1a2?q=80&w=1170&auto=format&fit=crop&",
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const; // <--- Add this

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
} as const; // <--- Add this
export default function GreenPulseDashboard() {
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux authentication selector metrics
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );

  const [currentSlide, setCurrentSlide] = useState(0);
  const [ngosList, setNgosList] = useState<NGO[]>([]);
  const [companiesList, setCompaniesList] = useState<CleaningCompany[]>([]);
  const [reviewsList, setReviewsList] = useState<IGlobalReview[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingInfrastructure, setLoadingInfrastructure] = useState(true);

  const [expandedNgoReviewId, setExpandedNgoReviewId] = useState<string | null>(
    null,
  );

  const [ngoReviewName, setNgoReviewName] = useState("");
  const [ngoReviewText, setNgoReviewText] = useState("");
  const [ngoReviewRating, setNgoReviewRating] = useState(5);

  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [summarizedTexts, setSummarizedTexts] = useState<
    Record<string, string>
  >({});
  const [aiLoadingStates, setAiLoadingStates] = useState<
    Record<string, boolean>
  >({});

  // Auth Protection Routing Interceptor
  const handleHireService = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      toast.error(
        "Authentication required. Please sign in to request industrial dispatch operations.",
      );
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", "/cleaning-requests");
      }
      router.push("/login");
      return;
    }

    if (user.role === "cleaning_company" || user.role === "CleaningCompany") {
      toast.error(
        "Cleaning enterprises are restricted from filing industrial deployment requests.",
      );
      return;
    }

    try {
      localStorage.setItem("companyId", user._id || user.id || "");
      localStorage.setItem("active_dispatch_role", user.role);
    } catch (err) {
      console.error("Storage write anomaly:", err);
    }

    dispatch(clearErrors());
    router.push("/cleaning-requests");
  };

  // Populate UI on load
  useEffect(() => {
    async function fetchDashboardData() {
      setLoadingInfrastructure(true);
      try {
        const results = await Promise.allSettled([
          cleaningCompanyService.getAllCompanies
            ? cleaningCompanyService.getAllCompanies()
            : Promise.resolve([]),
          ngoService.getAllNgo ? ngoService.getAllNgo() : Promise.resolve([]),
        ]);

        if (results[0].status === "fulfilled") {
          const resCompanies = results[0].value;
          setCompaniesList(
            Array.isArray(resCompanies)
              ? resCompanies
              : resCompanies?.data || [],
          );
        } else {
          setCompaniesList([]);
        }

        if (results[1].status === "fulfilled") {
          const resNgos = results[1].value;
          const pureNgos: NGO[] = Array.isArray(resNgos)
            ? resNgos
            : resNgos?.data || [];

          const enhancedNgos = pureNgos.map((ngo) => ({
            ...ngo,
            localReviews: ngo.localReviews || [
              {
                name: "Suman Kalyan",
                review:
                  "Incredibly active group inside the regional ecosystem space.",
                rating: 5,
              },
              {
                name: "Diya Banerjee",
                review: "Helped coordinate tree distribution programs nearby.",
                rating: 4,
              },
            ],
          }));
          setNgosList(enhancedNgos);
        } else {
          setNgosList([]);
        }

        setReviewsList([
          {
            name: "Rahul Sen",
            review:
              "Green Pulse helped our community organize a successful cleaning drive.",
            rating: 5,
          },
          {
            name: "Ananya Das",
            review:
              "The volunteer experience was smooth, modern and inspiring.",
            rating: 5,
          },
          {
            name: "Priya Roy",
            review:
              "Loved how NGOs and companies are connected on one platform.",
            rating: 4,
          },
        ]);
      } catch (error) {
        console.error("Data tracking pipeline issue:", error);
        toast.error("Error connecting to environment core systems.");
      } finally {
        setLoadingInfrastructure(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Auth Protection Routing Interceptor for Menu Items
  const handleMenuClick = (e: React.MouseEvent, path: string, name: string) => {
    if (!isAuthenticated || !user) {
      e.preventDefault();
      toast.error(`Authentication required. Please sign in to access ${name}.`);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("redirectAfterLogin", path);
      }
      router.push("/login");
    }
  };

  // Carousel timer loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () =>
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  const handlePrev = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length,
    );

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    setReviewsList([
      { name: newReviewName, review: newReviewText, rating: newReviewRating },
      ...reviewsList,
    ]);
    setNewReviewName("");
    setNewReviewText("");
    setNewReviewRating(5);
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  const handleNgoLocalReviewSubmit = (e: React.FormEvent, ngoId: string) => {
    e.preventDefault();
    if (!ngoReviewName.trim() || !ngoReviewText.trim()) {
      toast.error("Please completely fill out the review fields.");
      return;
    }

    const newLocalReview: LocalReview = {
      name: ngoReviewName,
      review: ngoReviewText,
      rating: ngoReviewRating,
    };

    setNgosList((prev) =>
      prev.map((ngo) => {
        if (ngo._id === ngoId) {
          return {
            ...ngo,
            localReviews: [newLocalReview, ...(ngo.localReviews || [])],
          };
        }
        return ngo;
      }),
    );

    setNgoReviewName("");
    setNgoReviewText("");
    setNgoReviewRating(5);
    toast.success(
      "Review successfully published to organizational profile feed.",
    );
  };

  const toggleNgoApprovalStatus = (ngoId: string) => {
    setNgosList((prev) =>
      prev.map((ngo) => {
        if (ngo._id === ngoId) {
          const updatedStatus = !ngo.isApproved;
          toast.success(
            `${ngo.ngoName} status turned to ${updatedStatus ? "Approved" : "Pending Verification"}`,
          );
          return { ...ngo, isApproved: updatedStatus };
        }
        return ngo;
      }),
    );
  };

  const toggleCompanyApprovalStatus = (companyId: string) => {
    setCompaniesList((prev) =>
      prev.map((company) => {
        if (company._id === companyId) {
          const updatedStatus = !company.isApproved;
          toast.success(
            `${company.companyName} status turned to ${updatedStatus ? "Approved" : "Pending Verification"}`,
          );
          return { ...company, isApproved: updatedStatus };
        }
        return company;
      }),
    );
  };

  const handleAiSummarize = async (ngoId: string, fullAboutText: string) => {
    if (summarizedTexts[ngoId]) {
      setSummarizedTexts((prev) => {
        const clone = { ...prev };
        delete clone[ngoId];
        return clone;
      });
      return;
    }

    if (!fullAboutText) {
      toast.error("No description available to summarize.");
      return;
    }
    if (fullAboutText.length < 50) {
      toast.error("Description too short for summary (Min 50 chars).");
      return;
    }

    setAiLoadingStates((prev) => ({ ...prev, [ngoId]: true }));

    try {
      const response = await fetch("http://localhost:4002/ai/summarize-ngo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: fullAboutText }),
      });

      if (!response.ok) throw new Error("Server rejected context logic.");
      const data = await response.json();

      if (data.success && data.summary) {
        setSummarizedTexts((prev) => ({ ...prev, [ngoId]: data.summary }));
        toast.success("AI profile overview parsed!");
      } else {
        toast.error(data.message || "Parsing data extraction error.");
      }
    } catch (err) {
      toast.error("AI summarization engine offline over port 4002.");
    } finally {
      setAiLoadingStates((prev) => ({ ...prev, [ngoId]: false }));
    }
  };


const filteredNgos = (ngosList || []).filter((ngo: NGO) => { // <--- Added : NGO type here
  const normalizeSearch = searchQuery.toLowerCase().trim();

  // If search box is empty, return everything safely
  if (!normalizeSearch) return true;

  // Safe type-checking for nested badges array
  const matchesBadge = ngo.badges?.some((badge) => 
    (badge.badgeName || "").toLowerCase().includes(normalizeSearch)
  ) || false;

  const matchesName = (ngo.ngoName || "").toLowerCase().includes(normalizeSearch);
  const matchesAbout = (ngo.about || "").toLowerCase().includes(normalizeSearch);
  const matchesLocation = `${ngo.city || ""} ${ngo.country || ""}`
    .toLowerCase()
    .includes(normalizeSearch);

  return matchesName || matchesAbout || matchesBadge || matchesLocation;
});

  return (
    <div className="flex flex-row bg-gradient-to-br from-green-950 via-green-900 to-emerald-950 text-white min-h-screen pt-[80px]">
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className="hidden lg:flex flex-col w-[290px] min-w-[290px] max-w-[290px] h-[calc(100vh-80px)] sticky top-[80px] overflow-y-auto bg-gradient-to-b from-green-950 via-emerald-900 to-black border-r border-green-700/20 p-6 scrollbar-none z-30">
        <h1 className="text-3xl font-bold text-green-300">Green Pulse</h1>
        <p className="text-sm text-gray-300 mt-2 leading-6">
          Together we clean streets, plant hope, and protect life. Environmental
          movements in India are grassroots and community-led campaigns aimed to
          protecting biodiversity, and halting ecologically destructive
          development projects.
        </p>
        <nav className="mt-2 flex flex-col gap-4">
          {menuItems.map((item, i) => (
            <Link
              key={i}
              href={item.path}
              onClick={(e) => handleMenuClick(e, item.path, item.name)}
            >
              <motion.div
                whileHover={{ x: 8 }}
                className="flex items-center justify-between bg-green-800/20 hover:bg-green-700/30 transition-all duration-300 px-4 py-3 rounded-2xl border border-green-600/20 cursor-pointer text-white hover:text-green-300"
              >
                <span>{item.name}</span>
                <ChevronRight size={18} />
              </motion.div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN LAYOUT CANVAS CONTAINER */}
      <main className="flex-1 overflow-hidden flex flex-col justify-between">
        <div>
          {/* HERO IMAGE SLIDER BLOCK */}
          <section className="relative h-[85vh] w-full overflow-hidden bg-black">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full"
              >
                <Image
                  src={
                    carouselSlides[currentSlide]?.image &&
                    carouselSlides[currentSlide].image.trim() !== ""
                      ? carouselSlides[currentSlide].image
                      : "/hero1.jpg"
                  }
                  alt="Campaign Slides"
                  fill
                  priority
                  className="object-cover pointer-events-none"
                />
              </motion.div>
            </AnimatePresence>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 border border-white/10 hover:bg-green-500/40 p-3 rounded-full hidden sm:block"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 border border-white/10 hover:bg-green-500/40 p-3 rounded-full hidden sm:block"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 max-w-5xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white"
              >
                {carouselSlides[currentSlide].title}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 text-base md:text-lg text-gray-200 max-w-2xl drop-shadow-md"
              >
                {carouselSlides[currentSlide].desc}
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex gap-4 mt-8 flex-wrap"
              >
                <Link
                  href="/campaigns"
                  className="bg-green-500 hover:bg-green-400 text-black px-7 py-3 rounded-full font-semibold transition-all hover:scale-105 shadow-xl shadow-green-500/20"
                >
                  Explore Campaigns
                </Link>
                <Link
                  href="/login"
                  className="border border-white/80 bg-white/5 backdrop-blur-sm text-white px-7 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition-all"
                >
                  Become Volunteer
                </Link>
              </motion.div>
            </div>
          </section>

          {/* ECOSYSTEM PERFORMANCE METRICS */}
          <section className="px-8 md:px-16 py-12">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <motion.div variants={cardVariants} className="bg-white/5 border border-green-700/20 rounded-2xl p-4 text-center">
                <Trees className="text-green-400 mx-auto" size={28} />
                <h4 className="mt-2 text-xl font-bold">200</h4>
                <p className="text-xs text-gray-400">Trees Planted</p>
              </motion.div>
              <motion.div variants={cardVariants} className="bg-white/5 border border-green-700/20 rounded-2xl p-4 text-center">
                <Users className="text-green-400 mx-auto" size={28} />
                <h4 className="mt-2 text-xl font-bold">50</h4>
                <p className="text-xs text-gray-400">Volunteers</p>
              </motion.div>
              <motion.div variants={cardVariants} className="bg-white/5 border border-green-700/20 rounded-2xl p-4 text-center">
                <Building className="text-emerald-400 mx-auto" size={28} />
                <h4 className="mt-2 text-xl font-bold">
                  {loadingInfrastructure ? "..." : ngosList.length}
                </h4>
                <p className="text-xs text-gray-400">Active NGOs</p>
              </motion.div>
              <motion.div variants={cardVariants} className="bg-white/5 border border-green-700/20 rounded-2xl p-4 text-center">
                <Briefcase className="text-emerald-400 mx-auto" size={28} />
                <h4 className="mt-2 text-xl font-bold">
                  {loadingInfrastructure ? "..." : companiesList.length}
                </h4>
                <p className="text-xs text-gray-400">Cleaning Company Partners</p>
              </motion.div>
            </motion.div>
          </section>

          {/* REGISTERED NGOS WORKSPACE CANVAS */}
          <section className="px-8 md:px-16 py-16 bg-black/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div className="flex items-center gap-3">
                <Leaf className="text-green-400" size={34} />
                <h2 className="text-4xl font-bold">OUR BEAUTIFUL NGOs</h2>
              </div>
              <div className="relative w-full md:w-80">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/60"
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search organizations, locations..."
                  className="w-full bg-white/5 border border-green-700/30 rounded-full py-2.5 pl-10 pr-10 text-white focus:border-green-400 transition-all outline-none text-sm"
                />
                {searchQuery && (
                  <X
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                    size={16}
                  />
                )}
              </div>
            </div>

            {loadingInfrastructure ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-96 bg-white/5 rounded-[30px] animate-pulse"
                  />
                ))}
              </div>
            ) : filteredNgos.length === 0 ? (
              <div className="text-gray-400 text-center py-16 border border-dashed border-green-700/30 rounded-[30px] bg-black/10">
                No active operational clusters located.
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredNgos.map((ngo) => {
                  const isAiLoading = aiLoadingStates[ngo._id] || false;
                  const hasAiSummary = summarizedTexts[ngo._id] !== undefined;

                  return (
                    <motion.div
                      layout
                      variants={cardVariants}
                      whileHover={{ y: -6, scale: 1.01 }}
                      key={ngo._id}
                      className="bg-gradient-to-b from-green-900/30 to-black/50 border border-green-700/20 rounded-[30px] overflow-hidden shadow-2xl flex flex-col justify-between group relative h-fit pb-6"
                    >
                      <div>
                        <div className="relative h-52 w-full bg-green-900/10 overflow-hidden">
                          <Image
                            src={
                              ngo.coverImage?.url &&
                              typeof ngo.coverImage.url === "string" &&
                              ngo.coverImage.url.trim() !== ""
                                ? ngo.coverImage.url
                                : "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=600"
                            }
                            alt="Cover Image"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span
                            className={`absolute top-4 left-4 text-xs px-3 py-1 rounded-full font-semibold shadow-lg text-black backdrop-blur-md ${ngo.isApproved ? "bg-green-400" : "bg-amber-400"}`}
                          >
                            {ngo.isApproved
                              ? "Approved"
                              : "Pending Action"}
                          </span>

                        </div>

                        <div className="p-6 space-y-4">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-2xl font-bold text-green-300 line-clamp-1">
                              {ngo.ngoName}
                            </h3>
                          </div>

                          {ngo.badges && ngo.badges.length > 0 && (
                            <div className="flex flex-wrap gap-2 py-1">
                              {ngo.badges.map((badge) => (
                                <div
                                  key={badge._id}
                                  style={{
                                    backgroundColor: badge.badgeColor
                                      ? `${badge.badgeColor}33`
                                      : "#22c55e22",
                                    borderColor: badge.badgeColor || "#22c55e",
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold text-white tracking-wide shadow-md"
                                >
                                  <Award
                                    size={14}
                                    className="text-amber-400 fill-amber-400"
                                  />
                                  <span>{badge.badgeName} Badge</span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="min-h-[60px]">
                            {hasAiSummary ? (
                              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-xs text-purple-200 leading-relaxed italic">
                                <span className="font-mono text-[9px] bg-purple-500 text-black px-1 rounded mr-1.5 not-italic font-bold">
                                  50W OVERVIEW
                                </span>
                                {summarizedTexts[ngo._id]}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                                {ngo.about || "Active Advocacy Hub Group."}
                              </p>
                            )}
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() =>
                                handleAiSummarize(ngo._id, ngo.about || "")
                              }
                              disabled={isAiLoading}
                              className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                                hasAiSummary
                                  ? "bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30"
                                  : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                              }`}
                            >
                              {isAiLoading ? (
                                <div className="w-3 h-3 border-2 border-t-transparent border-green-400 rounded-full animate-spin" />
                              ) : (
                                <Zap
                                  size={14}
                                  className={
                                    hasAiSummary
                                      ? "fill-purple-400 text-purple-400"
                                      : ""
                                  }
                                />
                              )}
                              <span>
                                {hasAiSummary
                                  ? "See Less"
                                  : "Read More (AI Clean Summary)"}
                              </span>
                            </button>
                          </div>

                          <div className="space-y-1 pt-2 border-t border-white/5 text-xs text-gray-400">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-green-400" />
                              <span>
                                {ngo.city || "West Bengal"},{" "}
                                {ngo.country || "India"}
                              </span>
                            </div>
                            {ngo.ngoType && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {ngo.ngoType.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-green-900/40 text-green-300 px-2 py-0.5 rounded text-[10px] border border-green-700/20 capitalize"
                                  >
                                    {t.replace("_", " ")}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* NGO REVIEWS INLINE FEED DRAWER */}
                      <div className="px-6">
                        <button
                          onClick={() =>
                            setExpandedNgoReviewId(
                              expandedNgoReviewId === ngo._id ? null : ngo._id,
                            )
                          }
                          className="flex items-center gap-2 text-xs font-bold text-green-400 hover:text-green-300 bg-white/5 border border-white/5 w-full py-2.5 rounded-xl justify-center transition-colors"
                        >
                          <MessageSquare size={14} />
                          {expandedNgoReviewId === ngo._id
                            ? "Close Reviews"
                            : `Reviews (${ngo.localReviews?.length || 0})`}
                        </button>

                        <AnimatePresence>
                          {expandedNgoReviewId === ngo._id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden mt-3 border-t border-white/5 pt-3 space-y-4"
                            >
                              <form
                                onSubmit={(e) =>
                                  handleNgoLocalReviewSubmit(e, ngo._id)
                                }
                                className="space-y-2.5 bg-black/40 p-3 rounded-xl border border-white/5"
                              >
                                <h4 className="text-[11px] font-bold text-green-300 uppercase tracking-wider">
                                  Leave Local Feedback
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    value={ngoReviewName}
                                    onChange={(e) =>
                                      setNgoReviewName(e.target.value)
                                    }
                                    placeholder="Name"
                                    className="bg-black/40 border border-white/10 px-3 py-1.5 rounded-lg text-xs outline-none text-white focus:border-green-400"
                                  />
                                  <div className="flex items-center justify-center gap-1 bg-black/20 rounded-lg border border-white/10 px-2">
                                    {[1, 2, 3, 4, 5].map((stars) => (
                                      <button
                                        type="button"
                                        key={stars}
                                        onClick={() =>
                                          setNgoReviewRating(stars)
                                        }
                                      >
                                        <Star
                                          size={12}
                                          className={
                                            stars <= ngoReviewRating
                                              ? "fill-amber-400 text-amber-400"
                                              : "text-gray-600"
                                          }
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={ngoReviewText}
                                    onChange={(e) =>
                                      setNgoReviewText(e.target.value)
                                    }
                                    placeholder="Write short review..."
                                    className="w-full bg-black/40 border border-white/10 px-3 py-2 pr-10 rounded-lg text-xs outline-none text-white focus:border-green-400"
                                  />
                                  <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-green-400 hover:text-white transition-colors"
                                  >
                                    <Send size={12} />
                                  </button>
                                </div>
                              </form>

                              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-green-900">
                                {ngo.localReviews &&
                                ngo.localReviews.length > 0 ? (
                                  ngo.localReviews.map((rev, rIdx) => (
                                    <div
                                      key={rIdx}
                                      className="bg-white/5 p-2.5 rounded-xl border border-white/5 space-y-1"
                                    >
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="font-bold text-green-400">
                                          {rev.name}
                                        </span>
                                        <div className="flex gap-0.5">
                                          {Array.from({
                                            length: rev.rating,
                                          }).map((_, sI) => (
                                            <Star
                                              key={sI}
                                              size={9}
                                              className="fill-amber-400 text-amber-400"
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <p className="text-[10px] text-gray-300 leading-relaxed italic">
                                        "{rev.review}"
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[10px] text-gray-500 text-center py-2">
                                    No individual card logs documented yet.
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </section>

          {/* PARTNER CLEANING ENTERPRISES WORKSPACE */}
          <section className="px-8 md:px-16 py-16">
            <div className="flex items-center gap-3 mb-12">
              <Briefcase className="text-green-400" size={34} />
              <h2 className="text-4xl font-bold">Partner Cleaning Companies</h2>
            </div>

            {loadingInfrastructure ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-96 bg-white/5 rounded-[30px] animate-pulse"
                  />
                ))}
              </div>
            ) : companiesList.length === 0 ? (
              <div className="text-gray-400 text-center py-16 border border-dashed border-emerald-700/30 rounded-[30px] bg-black/10">
                No enterprise network configurations detected.
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {companiesList.map((company, index) => (
                  <motion.div
                    variants={cardVariants}
                    whileHover={{ y: -6, scale: 1.01 }}
                    key={company._id || index}
                    className="bg-gradient-to-b from-emerald-900/30 to-black/50 border border-emerald-700/20 rounded-[30px] overflow-hidden shadow-2xl flex flex-col justify-between group relative h-fit"
                  >
                    <div>
                      <div className="relative h-52 w-full bg-emerald-900/10 overflow-hidden">
                        <Image
                          src={
                            company.coverImage?.url &&
                            typeof company.coverImage.url === "string" &&
                            company.coverImage.url.trim() !== ""
                              ? company.coverImage.url
                              : "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600"
                          }
                          alt="Company Cover"
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span
                          className={`absolute top-4 left-4 text-xs px-3 py-1 rounded-full font-semibold shadow-lg text-black backdrop-blur-md ${company.isApproved ? "bg-emerald-400" : "bg-amber-400"}`}
                        >
                          {company.isApproved
                            ? "Verified Enterprise"
                            : "Pending Status"}
                        </span>

                     
                      
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex flex-col gap-1">
                          <h3 className="text-2xl font-bold text-emerald-300 line-clamp-1">
                            {company.companyName}
                          </h3>
                          {company.ownerName && (
                            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <span>Proprietor:</span>
                              <span className="text-emerald-400 font-semibold">
                                {company.ownerName}
                              </span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-[11px] font-bold text-blue-400">
                            <CheckSquare size={11} />
                            <span>
                              {company.completedProjects || 0} Cleans Done
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                          {company.about ||
                            "Zero-waste certified commercial sanitation network partner."}
                        </p>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-2.5 pt-3 border-t border-white/5 text-[11px] text-gray-400">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Shield
                              size={12}
                              className="text-emerald-400 flex-shrink-0"
                            />
                            <span className="truncate">
                              Lic: {company.licenseNumber || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Users
                              size={12}
                              className="text-emerald-400 flex-shrink-0"
                            />
                            <span className="truncate">
                              {company.workersCount || 0} Field Staff
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Phone
                              size={12}
                              className="text-emerald-400 flex-shrink-0"
                            />
                            <span className="truncate">
                              Ph: {company.phone || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin
                              size={12}
                              className="text-emerald-400 flex-shrink-0"
                            />
                            <span className="truncate">
                              {company.city || "Kolkata"},{" "}
                              {company.state || "WB"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* REDUX CONNECTED HIRE ROUTE ACTION BUTTON */}
                    <div className="p-6 pt-0">
                      <button
                        type="button"
                        onClick={handleHireService}
                        className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 rounded-xl font-bold text-xs w-full block text-center text-black shadow-lg transition-all transform active:scale-95"
                      >
                        Hire Industrial Service
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          {/* SERVICE TRACK LAYOUT MAPS */}
          <section className="px-8 md:px-16 py-16 bg-black/10">
            <h2 className="text-3xl font-bold text-center mb-12">
              Our Main Environmental Tracks
            </h2>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: <Leaf size={32} />,
                  title: "Clean Waste",
                  desc: "Organizing modern waste pipeline management systems and municipal cleanliness drives.",
                },
                {
                  icon: <Trees size={32} />,
                  title: "Tree Plantation",
                  desc: "Curating city-wide rapid urban forest planting to revive depleting ecosystems.",
                },
                {
                  icon: <PawPrint size={32} />,
                  title: "Animal Shield",
                  desc: "Connecting local veterinary logistics lines and shelter spaces to secure stray animal life.",
                },
              ].map((item, i) => (
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  key={i}
                  className="bg-green-900/10 border border-green-700/10 rounded-[25px] p-6 backdrop-blur-md"
                >
                  <div className="text-green-400">{item.icon}</div>
                  <h3 className="text-xl font-bold mt-4">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* SOCIAL OUTREACH FIELDS */}
          <section className="px-8 md:px-16 py-16 bg-black/5">
            <h2 className="text-3xl font-bold text-center mb-12">
              Child Welfare & Education
            </h2>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: <BookOpen size={32} />,
                  title: "Literacy Frameworks",
                  desc: "Establishing after-school tutoring and basic literacy centers in marginalized urban communities.",
                },
                {
                  icon: <Laptop size={32} />,
                  title: "Digital Inclusion",
                  desc: "Equipping grassroots classrooms with computers, reliable internet, and basic tech literacy mentoring.",
                },
                {
                  icon: <Sparkles size={32} />,
                  title: "Creative Growth",
                  desc: "Sponsoring arts, sports, and skill-based workshops to build confidence outside traditional curricula.",
                },
              ].map((item, i) => (
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  key={i}
                  className="bg-green-900/10 border border-green-700/10 rounded-[25px] p-6 backdrop-blur-md"
                >
                  <div className="text-green-400">{item.icon}</div>
                  <h3 className="text-xl font-bold mt-4">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section className="px-8 md:px-16 py-16 bg-black/10">
            <h2 className="text-3xl font-bold text-center mb-12">
              Health & Nutrition Drive
            </h2>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: <Apple size={32} />,
                  title: "Food Security Pipelines",
                  desc: "Distributing freshly prepared, nutrient-dense meals to vulnerable populations and shelter networks.",
                },
                {
                  icon: <ShieldAlert size={32} />,
                  title: "Hygiene Literacy",
                  desc: "Conducting sanitation workshops and distributing essential hygiene kits in underserved neighborhoods.",
                },
                {
                  icon: <Stethoscope size={32} />,
                  title: "Mobile Health Clinics",
                  desc: "Deploying weekly medical vans to offer free diagnoses, basic prescriptions, and vital checkups.",
                },
              ].map((item, i) => (
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  key={i}
                  className="bg-green-900/10 border border-green-700/10 rounded-[25px] p-6 backdrop-blur-md"
                >
                  <div className="text-green-400">{item.icon}</div>
                  <h3 className="text-xl font-bold mt-4">{item.title}</h3>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* CAMPAIGN GALLERY */}
          <section className="px-8 md:px-16 py-16">
            <div className="flex items-center gap-3 mb-12">
              <Images className="text-green-400" size={32} />
              <h2 className="text-4xl font-bold">Campaign Gallery</h2>
            </div>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {gallery.map((img, i) => (
                <motion.div
                  variants={cardVariants}
                  whileHover={{ scale: 1.03 }}
                  key={i}
                  className="overflow-hidden rounded-[20px] bg-white/5 border border-white/10 aspect-square relative group"
                >
                  <Image
                    src={img}
                    alt="Gallery image"
                    fill
                    className="object-cover group-hover:scale-105 transition-all duration-700"
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* TESTIMONIAL FEED BACKBONE MODULE */}
          <section className="px-8 md:px-16 py-16 bg-black/20">
            <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 items-start">
              <div className="md:col-span-2 bg-gradient-to-b from-green-900/30 to-black/50 border border-green-700/20 p-6 rounded-[25px]">
                <h3 className="text-xl font-bold text-green-300 mb-1">
                  Share Platform Feedback
                </h3>
                <p className="text-xs text-gray-400 mb-6">
                  Contribute your user validation reviews to our system timeline
                  tracker.
                </p>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      placeholder="e.g. Parul Paul"
                      className="bg-black/40 border border-green-700/30 px-4 py-2.5 rounded-xl outline-none focus:border-green-400 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Ecosystem Quality Score
                    </label>
                    <div className="flex gap-1.5 bg-black/20 p-2 rounded-xl border border-green-700/10 w-fit">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => setNewReviewRating(n)}
                          className="active:scale-95 transition-transform"
                        >
                          <Star
                            size={18}
                            className={
                              n <= newReviewRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-600"
                            }
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Review Narrative
                    </label>
                    <textarea
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Elaborate your campaign or operation remarks..."
                      className="bg-black/40 border border-green-700/30 px-4 py-2.5 rounded-xl outline-none focus:border-green-400 h-24 resize-none text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-black shadow-lg hover:brightness-110"
                  >
                    <Send size={14} /> Post Live Verification Review
                  </button>
                  {formSubmitted && (
                    <p className="text-center text-[11px] text-green-400 animate-pulse">
                      ✔ Feedback appended cleanly to active browser layout cache
                      pipeline.
                    </p>
                  )}
                </form>
              </div>

              <div className="md:col-span-3 space-y-4 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="text-amber-400 fill-amber-400" size={20} />
                  <h3 className="text-xl font-bold">Community Testimonials</h3>
                </div>
                <div className="grid gap-3">
                  <AnimatePresence initial={false}>
                    {reviewsList.map((item, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        key={idx}
                        className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-green-300 text-sm">
                            {item.name}
                          </h4>
                          <div className="flex gap-0.5">
                            {Array.from({ length: item.rating }).map((_, i) => (
                              <Star
                                key={i}
                                size={11}
                                className="fill-amber-400 text-amber-400"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-300 text-xs leading-relaxed italic">
                          "{item.review}"
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          {/* FOOTER METADATA CONTACT LINKS */}
          <section className="px-8 md:px-16 py-16">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-green-700/10 to-emerald-700/10 border border-green-700/20 rounded-[35px] p-8"
            >
              <h2 className="text-3xl font-bold">Contact Us</h2>
              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="flex items-center gap-3">
                  <Phone className="text-green-400" />
                  <div>
                    <h4 className="font-bold text-sm">Phone</h4>
                    <p className="text-xs text-gray-400">+91 1234567890</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="text-green-400" />
                  <div>
                    <h4 className="font-bold text-sm">Email</h4>
                    <p className="text-xs text-gray-400">
                      admin1@yopmail.com
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="text-green-400" />
                  <div>
                    <h4 className="font-bold text-sm">Location</h4>
                    <p className="text-xs text-gray-400">Kolkata, India</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
}



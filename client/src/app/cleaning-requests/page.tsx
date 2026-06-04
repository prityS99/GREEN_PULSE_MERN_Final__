"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "../../Hooks/Redux/store";
import {
  Trash2,
  MapPin,
  FileText,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  Send,
  Star,
  UploadCloud,
  X,
  Layers,
  Building2
} from "lucide-react";

import { cleaningRequestsService, cleaningCompanyService } from "../../services/api";

type WasteType = "plastic" | "chemical" | "organic" | "electronic" | "mixed";

interface ICleaningRequestInput {
  location: string;
  wasteType: WasteType[];
  description: string;
  companyId: string;
  comment?: string;
}

export default function CreateCleaningRequestPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [requestStatus, setRequestStatus] = useState<"pending" | "completed">("pending");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const { user } = useSelector((state: RootState) => state.auth);

  const wasteOptions: WasteType[] = ["plastic", "chemical", "organic", "electronic", "mixed"];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ICleaningRequestInput>({
    defaultValues: {
      location: "",
      wasteType: ["mixed"],
      description: "",
      companyId: "",
      comment: ""
    },
  });

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoadingCompanies(true);


        const response = await cleaningCompanyService.getAllCompanies();

        const operationalData = response?.data ?? response ?? [];
        setCompaniesList(Array.isArray(operationalData) ? operationalData : []);
      } catch (err) {
        console.error("Failed to populate company options:", err);
        toast.error("Could not fetch verification agencies lists.");
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

        const selectedWasteTypes = watch("wasteType") || [];

        const handleWasteTypeToggle = (type: WasteType) => {
          let updatedTypes = [...selectedWasteTypes];
          if (updatedTypes.includes(type)) {
            if (updatedTypes.length === 1) return;
            updatedTypes = updatedTypes.filter((t) => t !== type);
          } else {
            updatedTypes.push(type);
          }
          setValue("wasteType", updatedTypes, { shouldValidate: true });
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;

          if (selectedFiles.length + files.length > 5) {
            toast.error("Maximum submission payload limited to 5 images.");
            return;
          }

          const newFiles: File[] = [];
          const newPreviews: string[] = [];

          for (let i = 0; i < files.length; i++) {
            newFiles.push(files[i]);
            newPreviews.push(URL.createObjectURL(files[i]));
          }

          setSelectedFiles((prev) => [...prev, ...newFiles]);
          setPreviews((prev) => [...prev, ...newPreviews]);
        };

        const removeLocalImage = (index: number) => {
          setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
          setPreviews((prev) => prev.filter((_, i) => i !== index));
        };

        /* =========================================================
            SUBMIT HANDLER
        ========================================================= */
        const onSubmit: SubmitHandler<ICleaningRequestInput> = async (data) => {
          if (selectedFiles.length === 0) {
            toast.error("Please provide at least 1 image file for site verification.");
            return;
          }

    if (!data.companyId) {
      toast.error("You must explicitly assign this request to a Cleaning Company.");
      return;
    }

    const toastId = toast.loading("Deploying operation metadata variables...");
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("location", data.location);
      formData.append("description", data.description);
      formData.append("status", requestStatus);
      formData.append("companyId", data.companyId); 

      const persistentUserId = user?._id || user?.id || "";
      formData.append("userId", persistentUserId);

      if (data.wasteType && data.wasteType.length > 0) {
        formData.append("wasteType", JSON.stringify(data.wasteType));
      } else {
        formData.append("wasteType", JSON.stringify(["mixed"]));
      }

      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (requestStatus === "completed" && rating > 0) {
        formData.append("reviewRating", String(rating));
        formData.append("reviewComment", data.comment || "");
      }

      const result = await cleaningRequestsService.createCleaningRequest(formData);

      if (result.success || result._id) {
        toast.success("Ecosystem Request Dispatched Successfully!", { id: toastId });
        reset();
        setSelectedFiles([]);
        setPreviews([]);
        setRating(0);

        setTimeout(() => {
          router.push("/ngo/dashboard");
        }, 1500);
      } else {
        throw new Error(result.error || "Failed to post parameters data.");
      }
    } catch (error: any) {
      console.error("Submission anomaly detected:", error);
      const operationalMessage = error.response?.data?.message || error.message || "Ecosystem interface dispatch breakdown.";
      toast.error(operationalMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07130d] text-white py-14 px-4 mt-10">
      <div className="max-w-6xl mx-auto">

        {/* NAVIGATION */}
        <div className="flex items-center justify-between mb-10">
          <Link href="/ngo/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition font-medium">
            <ArrowLeft size={18} /> Back Dashboard
          </Link>

          <div className="flex items-center gap-2 bg-black/30 border border-white/5 rounded-2xl p-1.5">
            <span className="text-xs text-gray-400 px-2 uppercase font-bold tracking-wider">Simulate Status:</span>
            <select
              className="text-xs bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 font-bold p-1.5 rounded-xl outline-none cursor-pointer"
              value={requestStatus}
              onChange={(e) => setRequestStatus(e.target.value as any)}
            >
              <option value="pending">State: Pending Request</option>
              <option value="completed">State: Completed (Review Form)</option>
            </select>
          </div>
        </div>

        {/* HERO BANNER */}
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-r from-emerald-950 via-[#0d1f16] to-black p-10 mb-10">
          <h1 className="text-5xl font-black leading-tight max-w-4xl">File Sanitation Request</h1>
          <p className="text-gray-300 mt-4 max-w-3xl">Local uploads are processed securely via our isolated cloud servers framework infrastructure.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

          {/* ASSIGN CLEANING AGENCY SELECTION */}
          <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
            <label className="text-sm text-gray-300 font-semibold block mb-3 flex items-center gap-2">
              <Building2 size={16} className="text-emerald-400" />
              Assign Environmental Cleaning Agency <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register("companyId", { required: "Please assign a specific company profile identifier" })}
                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 appearance-none text-white cursor-pointer font-medium disabled:opacity-40"
                disabled={loadingCompanies}
              >
                <option value="" className="bg-[#0d1e16] text-gray-400">
                  {loadingCompanies ? "Populating local networks data..." : "Select an active cleaning company from list..."}
                </option>
                {companiesList.map((company) => (
                  <option key={company._id} value={company._id} className="bg-[#0d1e16] text-white">
                    {company.companyName} ({company.city || "Regional Sector"})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400">
                {loadingCompanies ? <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> : "▼"}
              </div>
            </div>
            {errors.companyId && (
              <p className="text-rose-400 text-xs mt-2 font-bold px-1">{errors.companyId.message}</p>
            )}
          </div>

          {/* LOCATION INPUT */}
          <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
            <label className="text-sm text-gray-300 font-semibold block mb-3">Location Coordinates <span className="text-rose-500">*</span></label>
            <div className="relative">
              <input type="text" {...register("location", { required: true })} className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-emerald-500 text-white font-medium" placeholder="Enter collection area markers..." />
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>
          </div>

          {/* MATERIAL MIX CLASSIFICATION TILES */}
          <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3"><Layers className="text-emerald-400" /> Material Matrix Classification</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {wasteOptions.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleWasteTypeToggle(type)}
                  className={`p-4 border rounded-2xl capitalize text-left transition-all duration-200 flex flex-col justify-between h-24 font-bold ${selectedWasteTypes.includes(type) ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-black/20 text-gray-400"
                    }`}
                >
                  <span className="text-xs uppercase text-gray-500">Type</span>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* DESCRIPTION TEXTAREA */}
          <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
            <label className="text-sm text-gray-300 font-semibold block mb-3">Situation Log Details <span className="text-rose-500">*</span></label>
            <textarea rows={5} {...register("description", { required: true })} className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500定位 focus:border-emerald-500 resize-none text-white" placeholder="Outline structural hazards and size specifications..." />
          </div>

          {/* LOCAL EVIDENCE FILES BLOCK */}
          <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3"><ImageIcon className="text-emerald-400" /> Evidence Upload Queue</h2>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Queue: {selectedFiles.length} / 5 Selected</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
              {previews.map((src, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                  <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeLocalImage(index)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-rose-400 rounded-xl hover:bg-rose-500/20 transition">
                    <X size={14} />
                  </button>
                </div>
              ))}

              {selectedFiles.length < 5 && (
                <label className="border-2 border-dashed border-white/10 rounded-2xl aspect-square bg-black/20 hover:border-emerald-400 transition cursor-pointer flex flex-col items-center justify-center text-center p-4 text-gray-400 hover:text-emerald-400">
                  <UploadCloud className="mb-2" size={28} />
                  <span className="text-xs font-bold">Select File</span>
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* REVIEW SECTION */}
          {requestStatus === "completed" && (
            <div className="bg-[#0d1e16] border border-amber-500/20 rounded-[35px] p-8 space-y-6">
              <h2 className="text-2xl font-black flex items-center gap-3 text-amber-400"><Star className="fill-amber-400 text-amber-400" /> Operational Review</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm text-gray-300 block mb-3">Rating Score</label>
                  <div className="flex gap-1 bg-black/20 p-4 rounded-2xl w-fit">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button type="button" key={s} onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}>
                        <Star size={24} className={s <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-gray-600"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-300 block mb-3">Log Feedback Comments</label>
                  <input type="text" {...register("comment")} className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-amber-500" placeholder="Enter service evaluation notes..." />
                </div>
              </div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-emerald-600 to-green-500 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl transition-all">
            {isSubmitting ? <Loader2 className="animate-spin" size={22} /> : <Send size={22} />} Transmit Request
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import {
    Building2,
    MapPin,
    Phone,
    Image as ImageIcon,
    Loader2,
    ArrowLeft,
    ShieldCheck,
    FileText,
    Briefcase,
    Users,
    Activity,
} from "lucide-react";

import { cleaningCompanyService } from "../../../services/api";

interface ICompanySetupInput {
    companyName: string;
    licenseNumber: string;
    about: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    workersCount: number;
    experienceYears: number;
    coverImage: FileList;
}

export default function CreateCompanyPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ICompanySetupInput>({
        defaultValues: {
            country: "India",
            companyName: "",
            licenseNumber: "",
            about: "",
            phone: "",
            address: "",
            city: "",
            state: "",
            workersCount: 0,
            experienceYears: 0,
        },
    });

    const onSubmit: SubmitHandler<ICompanySetupInput> = async (data) => {
        const toastId = toast.loading("Creating cleaning company profile...");
        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append("companyName", data.companyName);
            formData.append("licenseNumber", data.licenseNumber);
            formData.append("about", data.about);
            formData.append("phone", data.phone);
            formData.append("address", data.address);
            formData.append("city", data.city);
            formData.append("state", data.state);
            formData.append("country", data.country);
            formData.append("workersCount", String(data.workersCount));
            formData.append("experienceYears", String(data.experienceYears));


            if (coverImage) {
                formData.append("coverImage", coverImage);
            }

            const res = await cleaningCompanyService.addCleaningCompany(formData);

            if (res?.success) {
                toast.success("Company Profile Created Successfully!", { id: toastId });

                // Capture the exact context tracking ID from the response payload
                const newCompanyId = res?.data?._id || res?.company?._id || res?._id;
                if (newCompanyId) {
                    localStorage.setItem("companyId", newCompanyId);
                }

                router.refresh();

                // Smooth dashboard redirection delay
                setTimeout(() => {
                    router.push("/cleaning-company/dashboard");
                }, 1500);
            } else {
                throw new Error(res?.message || "Failed to create company profile.");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#07130d] text-white py-14 px-4 mt-10">
            <div className="max-w-6xl mx-auto">

                {/* =========================================
                    TOP NAV
                ========================================= */}
                <div className="flex items-center justify-between mb-10">
                    <Link
                        href="/cleaning-company/dashboard"
                        className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition"
                    >
                        <ArrowLeft size={18} />
                        Back To Dashboard
                    </Link>

                    <div className="hidden md:flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                            <ShieldCheck className="text-emerald-400" size={22} />
                        </div>
                        <div>
                            <h3 className="font-black">Green Pulse Corporate</h3>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                Commercial Registration
                            </p>
                        </div>
                    </div>
                </div>

                {/* =========================================
                    HERO BANNER
                ========================================= */}
                <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-r from-emerald-950 via-[#0d1f16] to-black p-10 mb-10">
                    <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center blend-luminosity" />

                    <div className="relative">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <Briefcase className="text-emerald-400" size={40} />
                        </div>
                        <h1 className="text-5xl font-black leading-tight max-w-4xl">
                            Register Your Waste Management & Cleaning Venture
                        </h1>
                        <p className="text-gray-300 mt-6 max-w-3xl leading-relaxed">
                            Establish your operational footprint inside the Green Pulse dispatch network. Complete your commercial profile below to begin handling municipal sanitation routes, deploying specialized hazard crews, accepting waste classification collection orders, and managing regional ecosystem recovery logistics.
                        </p>
                    </div>
                </div>

                {/* =========================================
                    REGISTRATION FORM
                ========================================= */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* GENERAL INDUSTRIAL DETAILS */}
                    <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <Building2 className="text-emerald-400" />
                            Corporate Identity Info
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    {...register("companyName", { required: "Company Name is required" })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                    placeholder="EcoClean Solutions Private Limited"
                                />
                                {errors.companyName && (
                                    <p className="text-red-400 text-sm mt-2">{errors.companyName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    License Registration Number
                                </label>
                                <input
                                    type="text"
                                    {...register("licenseNumber", { required: "License Number is required" })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                    placeholder="LC-IND-XXXXXXXXX"
                                />
                                {errors.licenseNumber && (
                                    <p className="text-red-400 text-sm mt-2">{errors.licenseNumber.message}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    About Company / Scope of Services
                                </label>
                                <textarea
                                    rows={5}
                                    {...register("about", { required: "Please describe your operational capacities" })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 resize-none"
                                    placeholder="Detail your industrial expertise, mechanical sanitation capabilities, and specialized treatment options..."
                                />
                                {errors.about && (
                                    <p className="text-red-400 text-sm mt-2">{errors.about.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* OPERATIONAL CAPACITY METRICS */}
                    <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <Activity className="text-emerald-400" />
                            Operational Capacity & Metrics
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    Active Workers/Staff Count
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        {...register("workersCount", {
                                            required: "Staff count metrics are required",
                                            valueAsNumber: true,
                                            min: { value: 0, message: "Staff metrics cannot be negative" }
                                        })}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-emerald-500"
                                        placeholder="25"
                                    />
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                </div>
                                {errors.workersCount && (
                                    <p className="text-red-400 text-sm mt-2">{errors.workersCount.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    Years of Industrial Experience
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        {...register("experienceYears", {
                                            required: "Experience track metrics are required",
                                            valueAsNumber: true,
                                            min: { value: 0, message: "Experience cannot be negative" }
                                        })}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-emerald-500"
                                        placeholder="5"
                                    />
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                </div>
                                {errors.experienceYears && (
                                    <p className="text-red-400 text-sm mt-2">{errors.experienceYears.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* LOGISTICS & HQ MANAGEMENT */}
                    <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <MapPin className="text-emerald-400" />
                            Headquarters & Contact Routes
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    Office Street Address
                                </label>
                                <input
                                    type="text"
                                    {...register("address", { required: "Office address is required" })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                    placeholder="Suite 404, Salt Lake Sector V"
                                />
                                {errors.address && (
                                    <p className="text-red-400 text-sm mt-2">{errors.address.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    Hotline Phone Number
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        {...register("phone", {
                                            required: "Phone number is required",
                                            pattern: { value: /^[0-9+ ]{10,15}$/, message: "Invalid contact configuration" }
                                        })}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-5 py-4 outline-none focus:border-emerald-500"
                                        placeholder="+91 9876543210"
                                    />
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                </div>
                                {errors.phone && (
                                    <p className="text-red-400 text-sm mt-2">{errors.phone.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    City
                                </label>
                                <input
                                    type="text"
                                    {...register("city", { required: "City tracking location is required" })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                    placeholder="Kolkata"
                                />
                                {errors.city && (
                                    <p className="text-red-400 text-sm mt-2">{errors.city.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    State
                                </label>
                                <input
                                    type="text"
                                    {...register("state", { required: "State boundary is required" })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                    placeholder="West Bengal"
                                />
                                {errors.state && (
                                    <p className="text-red-400 text-sm mt-2">{errors.state.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    Country
                                </label>
                                <input
                                    type="text"
                                    disabled
                                    {...register("country")}
                                    className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CORPORATE BRAND ASSET COVER IMAGE */}
                    <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <ImageIcon className="text-emerald-400" />
                            Corporate Branding Banner
                        </h2>

                        <label className="border-2 border-dashed border-white/10 rounded-[30px] p-12 bg-black/20 hover:border-emerald-500/40 transition cursor-pointer flex flex-col items-center justify-center text-center">
                            <ImageIcon className="text-emerald-400 mb-4" size={45} />
                            <h3 className="font-black text-xl">Upload Fleet or Company Banner</h3>
                            <p className="text-gray-400 mt-2">PNG, JPG up to 5MB</p>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                {...register("coverImage", {
                                    required: "Corporate branding image is required",
                                    onChange: (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setCoverImage(file);
                                            setPreview(URL.createObjectURL(file));
                                        }
                                    },
                                })}
                            />
                            {preview && (
                                <div className="mt-6 flex justify-center w-full">
                                    <img
                                        src={preview}
                                        alt="Corporate Cover Preview"
                                        className="w-full max-w-2xl h-64 object-cover rounded-3xl border border-white/10 shadow-lg"
                                    />
                                </div>
                            )}
                        </label>
                        {errors.coverImage && (
                            <p className="text-red-400 text-sm mt-2 text-center">{errors.coverImage.message}</p>
                        )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 transition-all duration-300 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={22} />
                                Provisioning Corporate Profile...
                            </>
                        ) : (
                            <>
                                <FileText size={22} />
                                Create Company Profile
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}
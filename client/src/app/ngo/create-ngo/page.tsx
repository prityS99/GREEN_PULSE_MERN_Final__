"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    Building2,
    MapPin,
    Users,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Leaf,
    ShieldCheck,
} from "lucide-react";

import { ngoService } from "@/services/api";

interface INGOSetupInput {
    ngoName: string;
    about: string;
    address: string;
    city: string;
    country: string;
    inaugurationDate: string;
    ngoType: string[];
    members: {
        children: number;
        elders: number;
        adults: number;
    };
    coverImage: FileList;
}

export default function CreateNgo() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const [statusMessage, setStatusMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<INGOSetupInput>({
        defaultValues: {
            country: "India",
            ngoType: ["environment"],
            members: {
                children: 0,
                elders: 0,
                adults: 0,
            },
        },
    });

    const onSubmit: SubmitHandler<INGOSetupInput> = async (data) => {
        try {
            setIsSubmitting(true);
            setStatusMessage(null);

            const formData = new FormData();
            formData.append("ngoName", data.ngoName);
            formData.append("about", data.about);
            formData.append("address", data.address);
            formData.append("city", data.city);
            formData.append("country", data.country);
            formData.append("inaugurationDate", data.inaugurationDate);
            formData.append("ngoType", JSON.stringify(data.ngoType));
            formData.append("members", JSON.stringify(data.members));

            if (coverImage) {
                formData.append("coverImage", coverImage);
            }

            const result = await ngoService.addNgo(formData);

            if (result.success) {
                setStatusMessage({
                    type: "success",
                    text: "NGO Profile Created Successfully! Redirecting...",
                });

                setTimeout(() => {
                    router.push("/ngo/dashboard");
                }, 2000);
            } else {
                throw new Error(result.message || "Failed to create NGO profile.");
            }
        } catch (error: any) {
            setStatusMessage({
                type: "error",
                text: error.message || "Something went wrong",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#07130d] text-white py-14 px-4">
            <div className="max-w-6xl mx-auto">


                {/* =========================================
                    TOP NAV
                ========================================= */}
                <div className="flex items-center justify-between mb-10">
                    <Link
                        href="/ngo/dashboard"
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
                            <h3 className="font-black">Green Pulse NGO Portal</h3>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">
                                Environmental Registration
                            </p>
                        </div>
                    </div>
                </div>

                {/* =========================================
                    HERO BANNER
                ========================================= */}
                <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-r from-emerald-950 via-[#0d1f16] to-black p-10 mb-10">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                    <div className="relative">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <Leaf className="text-emerald-400" size={40} />
                        </div>
                        <h1 className="text-5xl font-black leading-tight max-w-4xl">
                            Register Your NGO & Join The Green Movement
                        </h1>
                        <p className="text-gray-300 mt-6 max-w-3xl leading-relaxed">
                            Across generations, communities have protected rivers, forests, animals, and human dignity through service. Complete your NGO profile to begin environmental campaigns, volunteer activities, rescue operations, and sustainability missions inside Green Pulse.
                        </p>
                    </div>
                </div>

                {/* =========================================
                    STATUS ALERT
                ========================================= */}
                {statusMessage && (
                    <div
                        className={`mb-8 rounded-3xl border p-5 flex items-center gap-3 ${statusMessage.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}
                    >
                        {statusMessage.type === "success" ? <CheckCircle2 /> : <AlertCircle />}
                        <span className="font-semibold">{statusMessage.text}</span>
                    </div>
                )}

                {/* =========================================
                    REGISTRATION FORM
                ========================================= */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                    {/* GENERAL INFO */}
                    <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <Building2 className="text-emerald-400" />
                            General Information
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    NGO Name
                                </label>
                                <input
                                    type="text"
                                    {...register("ngoName", { required: "NGO Name is required" })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                    placeholder="Green Pulse Foundation"
                                />
                                {errors.ngoName && (
                                    <p className="text-red-400 text-sm mt-2">{errors.ngoName.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    Inauguration Date
                                </label>
                                <input
                                    type="date"
                                    {...register("inaugurationDate", { required: "Inauguration Date is required" })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                />
                                {errors.inaugurationDate && (
                                    <p className="text-red-400 text-sm mt-2">{errors.inaugurationDate.message}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    About NGO
                                </label>
                                <textarea
                                    rows={5}
                                    {...register("about", { required: "Please provide a brief description of your NGO" })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500 resize-none"
                                    placeholder="Describe your mission and initiatives..."
                                />
                                {errors.about && (
                                    <p className="text-red-400 text-sm mt-2">{errors.about.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* LOCATION DETAILS */}
                    <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <MapPin className="text-emerald-400" />
                            Location Details
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-3">
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    {...register("address", { required: "Address is required" })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                />
                                {errors.address && (
                                    <p className="text-red-400 text-sm mt-2">{errors.address.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    City
                                </label>
                                <input
                                    type="text"
                                    {...register("city", { required: "City is required" })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                />
                                {errors.city && (
                                    <p className="text-red-400 text-sm mt-2">{errors.city.message}</p>
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

                    {/* SECTORS */}
                    <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
                        <h2 className="text-2xl font-black mb-8">NGO Operational Sectors</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                            {["environment", "child_welfare", "old_age", "animal_welfare", "education"].map((sector) => (
                                <label
                                    key={sector}
                                    className="bg-black/20 border border-white/10 rounded-2xl p-5 hover:border-emerald-500 transition cursor-pointer flex items-center gap-3 capitalize"
                                >
                                    <input
                                        type="checkbox"
                                        value={sector}
                                        {...register("ngoType")}
                                        className="w-5 h-5 accent-emerald-500"
                                    />
                                    {sector.replace("_", " ")}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* STATISTICS */}
                    <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <Users className="text-emerald-400" />
                            Member Statistics
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    Children
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    {...register("members.children", { valueAsNumber: true })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    Adult Members
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    {...register("members.adults", { valueAsNumber: true })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-300 font-semibold block mb-3">
                                    Elders Members
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    {...register("members.elders", { valueAsNumber: true })}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* COVER IMAGE */}
                    <div className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8">
                        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <ImageIcon className="text-emerald-400" />
                            Cover Image
                        </h2>

                        <label className="border-2 border-dashed border-white/10 rounded-[30px] p-12 bg-black/20 hover:border-emerald-500/40 transition cursor-pointer flex flex-col items-center justify-center text-center">
                            <ImageIcon className="text-emerald-400 mb-4" size={45} />
                            <h3 className="font-black text-xl">Upload NGO Banner</h3>
                            <p className="text-gray-400 mt-2">PNG, JPG up to 5MB</p>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                {...register("coverImage", {
                                    required: "Banner image is required",
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
                                <div className="mt-6 flex justify-center">
                                    <img
                                        src={preview}
                                        alt="Cover Preview"
                                        className="w-full max-w-2xl h-64 object-cover rounded-3xl border border-white/10 shadow-lg"
                                    />
                                </div>
                            )}
                        </label>
                        {errors.coverImage && (
                            <p className="text-red-400 text-sm mt-2 text-center">{errors.coverImage.message}</p>
                        )}
                    </div>
                    <div>


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
                                Creating NGO Profile...
                            </>
                        ) : (
                            <>
                                <Leaf size={22} />
                                Create NGO Profile
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
    Building2,
    MapPin,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Sparkles,
    ShieldCheck,
    Phone,
    FileText,
    Users,
    Activity,
    Save
} from "lucide-react";

import { cleaningCompanyService } from "../../../../services/api";

export default function EditCompanyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [newFile, setNewFile] = useState<File | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        companyName: "",
        licenseNumber: "",
        about: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        workersCount: 0,
        experienceYears: 0,
    });

    /* =========================================================
        1. FETCH INITIAL REGISTERED CORPORATE DATA
    ========================================================= */
    useEffect(() => {
        const fetchCompany = async () => {
            try {
                setLoading(true);
                
                const response = await cleaningCompanyService.getOwnCompanyProfile();
                const company = response?.data ?? response;

                if (company && company._id) {
                    setCompanyId(company._id);
                    setFormData({
                        companyName: company.companyName || "",
                        licenseNumber: company.licenseNumber || "",
                        about: company.about || "",
                        phone: company.phone || "",
                        address: company.address || "",
                        city: company.city || "",
                        state: company.state || "",
                        workersCount: company.workersCount || 0,
                        experienceYears: company.experienceYears || 0,
                    });
                    setImagePreview(company.coverImage?.url || null);
                } else {
                    toast.error("No valid cleaning company profile context found.");
                    router.push("/cleaning-company/dashboard");
                }
            } catch (error: any) {
                console.error("Profile payload sync crash:", error);
                toast.error("Failed to sync your corporate dimensions.");
            } finally {
                setLoading(false);
            }
        };

        fetchCompany();
    }, [router]);

    /* =========================================================
        2. HANDLE IMAGE MUTATION PREVIEW
    ========================================================= */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    /* =========================================================
        3. SUBMIT MUTATED FORM DATA PAYLOAD
    ========================================================= */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyId) {
            toast.error("Company configuration pointer missing.");
            return;
        }

        try {
            setUpdating(true);
            const formDataToSend = new FormData();

            formDataToSend.append("companyId", companyId);
            formDataToSend.append("companyName", formData.companyName);
            formDataToSend.append("licenseNumber", formData.licenseNumber);
            formDataToSend.append("about", formData.about);
            formDataToSend.append("phone", formData.phone);
            formDataToSend.append("address", formData.address);
            formDataToSend.append("city", formData.city);
            formDataToSend.append("state", formData.state);
            formDataToSend.append("country", "India");
            formDataToSend.append("workersCount", formData.workersCount.toString());
            formDataToSend.append("experienceYears", formData.experienceYears.toString());

            if (newFile) {
                formDataToSend.append("coverImage", newFile);
            }

            const response = await cleaningCompanyService.updateCleaningCompany(formDataToSend);

            if (response?.success || response) {
                toast.success("Corporate Profile Updated Successfully!");
                setTimeout(() => {
                    router.push("/cleaning-company/dashboard");
                }, 1500);
            } else {
                toast.error(response?.message || "Operation mapping adjustment rejected.");
            }
        } catch (error: any) {
            console.error("Payload synchronization failed:", error);
            const serverMessage = error.response?.data?.message || "Server infrastructure pipeline dropped.";
            toast.error(`Error: ${serverMessage}`);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-950 via-black to-emerald-900 text-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-14 h-14 animate-spin text-emerald-400" />
                    <h2 className="text-2xl font-bold tracking-wide">Loading Operational Configs...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-10 min-h-screen bg-[#07130d] text-white py-14 px-4">
            <div className="max-w-4xl mx-auto">
                
                {/* TOP BAR NAVIGATION LINK */}
                <div className="flex items-center justify-between mb-10">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition font-bold text-sm"
                    >
                        <ArrowLeft size={18} /> Back To Dashboard
                    </button>
                    <h1 className="text-3xl font-black text-white tracking-tight">Edit Corporate Profile</h1>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-8">
                    
                    {/* COVER BRAND PHOTOGRAPHY IMAGING SECTION */}
                    <section className="bg-[#0d1e16] border border-white/10 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <label className="block text-sm font-black uppercase tracking-widest text-emerald-400 mb-4">
                            Corporate Cover Banner
                        </label>
                        <div className="relative group cursor-pointer">
                            <div className="w-full h-72 rounded-3xl overflow-hidden bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center relative">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview Banner" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={48} className="text-gray-600" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white font-bold text-sm bg-emerald-500/20 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/30">
                                        Mutate Brand Image
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </section>

                    {/* GENERAL METADATA CARD */}
                    <div className="bg-[#0d1e16] border border-white/10 p-8 rounded-[2.5rem] shadow-xl grid gap-6">
                        <h2 className="text-xl font-black flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-3">
                            <Building2 size={20} /> General Specifications
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-gray-400 block mb-2">Company Name</label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-400 block mb-2">License Key / Code</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                        className="w-full pl-12 pr-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                        required
                                    />
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* CAPACITY INT INTEGRATION */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-gray-400 block mb-2">Active Labor Capacity (Staff)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.workersCount}
                                        onChange={(e) => setFormData({ ...formData, workersCount: parseInt(e.target.value) || 0 })}
                                        className="w-full pl-12 pr-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                        required
                                    />
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-400 block mb-2">Years of Field Experience</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.experienceYears}
                                        onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value) || 0 })}
                                        className="w-full pl-12 pr-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                        required
                                    />
                                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Hotline Connection Phone</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-12 pr-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold md:w-1/2"
                                    required
                                />
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Operational Brand Overview (About)</label>
                            <textarea
                                value={formData.about}
                                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                rows={6}
                                className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-medium text-gray-300 resize-none"
                                required
                            />
                        </div>
                    </div>

                    {/* COORDINATE PLACEMENT CARD */}
                    <div className="bg-[#0d1e16] border border-white/10 p-8 rounded-[2.5rem] shadow-xl grid gap-6">
                        <h2 className="text-xl font-black flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-3">
                            <MapPin size={20} /> Regional Footprint
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-3">
                                <label className="text-sm font-bold text-gray-400 block mb-2">Physical Headquarters Address</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-400 block mb-2">City</label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-400 block mb-2">State Zone</label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-500 block mb-2">Nation Status</label>
                                <input
                                    type="text"
                                    disabled
                                    value="India"
                                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-gray-500 cursor-not-allowed font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* OPERATIONAL DISPATCH ACTIONS */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={updating}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-70 shadow-xl shadow-emerald-950/20"
                        >
                            {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-10 py-5 bg-white/5 border border-white/10 text-gray-400 rounded-2xl font-black hover:bg-white/10 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
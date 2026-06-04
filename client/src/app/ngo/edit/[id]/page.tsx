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
    ArrowLeft,
    Leaf,
    ShieldCheck,
    Users,
    Save,
    Calendar,
    AlignLeft
} from "lucide-react";

import { ngoService } from "@/services/api";

export default function EditNgo() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [newFile, setNewFile] = useState<File | null>(null);
    const [ngoId, setNgoId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        ngoName: "",
        about: "",
        address: "",
        city: "",
        country: "India",
        inaugurationDate: "",
        ngoType: [] as string[],
        members: {
            children: 0,
            adults: 0,
            elders: 0
        }
    });

    /* =========================================================
        1. FETCH INITIAL REGISTERED NGO DATA
    ========================================================= */
    useEffect(() => {
        const fetchNGOData = async () => {
            try {
                setLoading(true);
                
                const response = await ngoService.getMyNgo();
                const ngo = response?.data ?? response;

                if (ngo && ngo._id) {
                    setNgoId(ngo._id);
                    setFormData({
                        ngoName: ngo.ngoName || "",
                        about: ngo.about || "",
                        address: ngo.address || "",
                        city: ngo.city || "",
                        country: ngo.country || "India",
                        inaugurationDate: ngo.inaugurationDate ? ngo.inaugurationDate.split("T")[0] : "",
                        ngoType: ngo.ngoType || [],
                        members: {
                            children: ngo.members?.children || 0,
                            adults: ngo.members?.adults || 0,
                            elders: ngo.members?.elders || 0
                        }
                    });
                    setImagePreview(ngo.coverImage?.url || null);
                } else {
                    toast.error("No registered NGO workspace context found.");
                    router.push("/ngo/dashboard");
                }
            } catch (error: any) {
                console.error("NGO profile load crash:", error);
                toast.error("Failed to load existing NGO parameters.");
            } finally {
                setLoading(false);
            }
        };

        fetchNGOData();
    }, [router]);

    /* =========================================================
        2. HANDLE IMAGE PREVIEW MUTATION
    ========================================================= */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    /* =========================================================
        3. HANDLE SECTOR CHECKBOX SELECTIONS
    ========================================================= */
    const handleCheckboxChange = (sector: string) => {
        const currentSectors = [...formData.ngoType];
        if (currentSectors.includes(sector)) {
            setFormData({
                ...formData,
                ngoType: currentSectors.filter((s) => s !== sector)
            });
        } else {
            setFormData({
                ...formData,
                ngoType: [...currentSectors, sector]
            });
        }
    };

    /* =========================================================
        4. SUBMIT MUTATED FORM PAYLOAD
    ========================================================= */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!ngoId) {
            toast.error("NGO configuration identification pointer missing.");
            return;
        }

        try {
            setUpdating(true);
            const formDataToSend = new FormData();

            // Append standard metadata text keys
            formDataToSend.append("ngoId", ngoId);
            formDataToSend.append("ngoName", formData.ngoName);
            formDataToSend.append("about", formData.about);
            formDataToSend.append("address", formData.address);
            formDataToSend.append("city", formData.city);
            formDataToSend.append("country", formData.country);
            formDataToSend.append("inaugurationDate", formData.inaugurationDate);
            formDataToSend.append("ngoType", JSON.stringify(formData.ngoType));
            formDataToSend.append("members", JSON.stringify(formData.members));

            if (newFile) {
                formDataToSend.append("coverImage", newFile);
            }

            const response = await ngoService.updateNgo(formDataToSend);

            if (response?.success || response) {
                toast.success("NGO Profile Updated Successfully!");
                setTimeout(() => {
                    router.push("/ngo/dashboard");
                }, 1500);
            } else {
                toast.error(response?.message || "Operation adjustment update failed.");
            }
        } catch (error: any) {
            console.error("NGO update error:", error);
            const serverMessage = error.response?.data?.message || "Infrastructure pipeline dropped update.";
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
                    <h2 className="text-2xl font-bold tracking-wide">Loading Profile Configs...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-15 min-h-screen bg-[#07130d] text-white py-14 px-4">
            <div className="max-w-4xl mx-auto">

                {/* TOP BAR LAYOUT */}
                <div className="flex items-center justify-between mb-10">
                   <Link
                        href="/ngo/dashboard"
                        className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition"
                    >
                        <ArrowLeft size={18} />
                        Back To Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-white tracking-tight">Edit NGO Workspace</h1>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-8">

                    {/* BRANDING COVER IMAGE SECTION */}
                    <section className="bg-[#0d1e16] border border-white/10 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                        <label className="block text-sm font-black uppercase tracking-widest text-emerald-400 mb-4">
                            Cover Banner Photography
                        </label>
                        <div className="relative group cursor-pointer">
                            <div className="w-full h-72 rounded-3xl overflow-hidden bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center relative">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="NGO Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={48} className="text-gray-600" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white font-bold text-sm bg-emerald-500/20 backdrop-blur-md px-4 py-2 rounded-xl border border-emerald-500/30">
                                        Change Canvas Image
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

                    {/* METADATA BASE FIELDS */}
                    <div className="bg-[#0d1e16] border border-white/10 p-8 rounded-[2.5rem] shadow-xl grid gap-6">
                        <h2 className="text-xl font-black flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-3">
                            <Building2 size={20} /> Identity Settings
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-bold text-gray-400 block mb-2">NGO Name</label>
                                <input
                                    type="text"
                                    value={formData.ngoName}
                                    onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                                    className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-400 block mb-2">Inauguration Foundation Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.inaugurationDate}
                                        onChange={(e) => setFormData({ ...formData, inaugurationDate: e.target.value })}
                                        className="w-full pl-12 pr-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                        required
                                    />
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Workspace Core Mission Statements (About)</label>
                            <textarea
                                value={formData.about}
                                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                rows={6}
                                className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-medium text-gray-300 resize-none"
                                required
                            />
                        </div>
                    </div>

                    {/* DYNAMIC REGIONAL MAP DESIGNATIONS */}
                    <div className="bg-[#0d1e16] border border-white/10 p-8 rounded-[2.5rem] shadow-xl grid gap-6">
                        <h2 className="text-xl font-black flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-3">
                            <MapPin size={20} /> Geographic Target Coordinates
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-3">
                                <label className="text-sm font-bold text-gray-400 block mb-2">Headquarters Address</label>
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
                                <label className="text-sm font-bold text-gray-500 block mb-2">Country Origin Status</label>
                                <input
                                    type="text"
                                    disabled
                                    value="India"
                                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-gray-500 cursor-not-allowed font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    {/* CHECKBOX OPERATIONAL SECTORS */}
                    <div className="bg-[#0d1e16] border border-white/10 p-8 rounded-[2.5rem] shadow-xl grid gap-6">
                        <h2 className="text-xl font-black text-emerald-400 border-b border-white/5 pb-3">NGO Deployment Domains</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {["environment", "child_welfare", "old_age", "animal_welfare", "education"].map((sector) => (
                                <label
                                    key={sector}
                                    className="bg-black/20 border border-white/10 rounded-2xl p-4 hover:border-emerald-500 transition cursor-pointer flex items-center gap-3 capitalize font-bold text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.ngoType.includes(sector)}
                                        onChange={() => handleCheckboxChange(sector)}
                                        className="w-5 h-5 accent-emerald-500"
                                    />
                                    {sector.replace("_", " ")}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* NESTED CORE VOLUNTEER METRICS MATRIX */}
                    <div className="bg-[#0d1e16] border border-white/10 p-8 rounded-[2.5rem] shadow-xl grid gap-6">
                        <h2 className="text-xl font-black flex items-center gap-2 text-emerald-400 border-b border-white/5 pb-3">
                            <Users size={20} /> Demographic Capacity Dimensions
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-sm font-bold text-gray-400 block mb-2">Children Capacity</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.members.children}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        members: { ...formData.members, children: parseInt(e.target.value) || 0 }
                                    })}
                                    className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-400 block mb-2">Adult Volunteers</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.members.adults}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        members: { ...formData.members, adults: parseInt(e.target.value) || 0 }
                                    })}
                                    className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-400 block mb-2">Elder Activists</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.members.elders}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        members: { ...formData.members, elders: parseInt(e.target.value) || 0 }
                                    })}
                                    className="w-full px-5 py-4 bg-black/20 border border-white/10 rounded-2xl outline-none focus:border-emerald-500 font-bold"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* OPERATIONAL DISPATCH BUTTONS */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={updating}
                            className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-70 shadow-xl"
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

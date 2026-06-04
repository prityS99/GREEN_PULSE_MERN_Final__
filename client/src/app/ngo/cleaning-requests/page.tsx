"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";

import {
  MapPin,
  FileText,
  Trash2,
  Upload,
  Loader2,
  Send,
  Leaf,
} from "lucide-react";

interface FormData {
  location: string;
  description: string;
  wasteType: string[];
  images: FileList;
}

const wasteOptions = [
  "plastic",
  "chemical",
  "organic",
  "electronic",
  "mixed",
];

export default function CleaningRequestForm() {

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>();

  const [loading, setLoading] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  /* =========================================================
      HANDLE WASTE TYPE
  ========================================================= */

  const toggleWasteType = (type: string) => {
    let updated: string[] = [];
    if (selectedWaste.includes(type)) {
      updated = selectedWaste.filter((item) => item !== type);
    } else {
      updated = [...selectedWaste, type];

    }
    setSelectedWaste(updated);
    setValue("wasteType", updated);
  };

  /* =========================================================
      HANDLE IMAGE PREVIEW
  ========================================================= */

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files) return;
    const imageUrls = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewImages(imageUrls);
  };

  /* =========================================================
      SUBMIT
  ========================================================= */

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("location", data.location);
      formData.append("description", data.description);

      selectedWaste.forEach((item) => {
        formData.append("wasteType", item);
      });

      if (data.images) {

        Array.from(data.images).forEach((file) => {
          formData.append("images", file);
        });

      }

      console.log("SUBMIT DATA:", data);

      // API CALL HERE

      // await cleaningRequestService.createRequest(formData)

      reset();

      setSelectedWaste([]);

      setPreviewImages([]);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="mt-10 min-h-screen bg-[#07130d] text-white py-16 px-4">

      <div className="max-w-4xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="text-center mb-12">

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-6">

            <Leaf className="text-emerald-400" size={40} />

          </div>

          <h1 className="text-5xl font-black">
            Cleaning Request
          </h1>

          <p className="text-gray-400 mt-4 max-w-2xl mx-auto leading-relaxed">
            Cleaner streets, cleaner rivers, cleaner tomorrows.
            Report waste problems and connect with environmental
            teams working to restore balance to nature.
          </p>

        </div>

        {/* =====================================================
            FORM
        ===================================================== */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-[#0d1e16] border border-white/10 rounded-[35px] p-8 md:p-10 shadow-2xl space-y-8"
        >

          {/* LOCATION */}

          <div>

            <label className="text-sm font-bold text-gray-300 mb-3 block">
              Location
            </label>

            <div className="relative">

              <MapPin
                className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Enter waste location"
                {...register("location", {
                  required: "Location is required",
                })}
                className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-emerald-500 transition-all duration-300"
              />

            </div>

            {errors.location && (
              <p className="text-red-400 text-sm mt-2">
                {errors.location.message}
              </p>
            )}

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="text-sm font-bold text-gray-300 mb-3 block">
              Description
            </label>

            <div className="relative">

              <FileText
                className="absolute left-4 top-5 text-emerald-400"
                size={20}
              />

              <textarea
                rows={5}
                placeholder="Describe the cleaning issue..."
                {...register("description", {
                  required: "Description is required",
                })}
                className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-emerald-500 transition-all duration-300 resize-none"
              />

            </div>

            {errors.description && (
              <p className="text-red-400 text-sm mt-2">
                {errors.description.message}
              </p>
            )}

          </div>

          {/* WASTE TYPES */}

          <div>

            <label className="text-sm font-bold text-gray-300 mb-4 block">
              Waste Type
            </label>

            <div className="flex flex-wrap gap-4">

              {wasteOptions.map((type) => (

                <button
                  type="button"
                  key={type}
                  onClick={() => toggleWasteType(type)}
                  className={`px-5 py-3 rounded-2xl border transition-all duration-300 capitalize font-semibold ${
                    selectedWaste.includes(type)
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-black/20 border-white/10 hover:border-emerald-500/40"
                  }`}
                >

                  {type}

                </button>

              ))}

            </div>

          </div>

          {/* IMAGE UPLOAD */}

          <div>

            <label className="text-sm font-bold text-gray-300 mb-4 block">
              Upload Images
            </label>

            <label className="border-2 border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/40 transition-all duration-300 bg-black/20">

              <Upload className="text-emerald-400 mb-4" size={40} />

              <h3 className="font-bold text-lg">
                Upload Waste Images
              </h3>

              <p className="text-gray-400 text-sm mt-2">
                JPG, PNG or WEBP supported
              </p>

              <input
                type="file"
                multiple
                {...register("images")}
                onChange={handleImageChange}
                className="hidden"
              />

            </label>

            {/* PREVIEW */}

            {previewImages.length > 0 && (

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

                {previewImages.map((image, index) => (

                  <div
                    key={index}
                    className="relative h-32 rounded-2xl overflow-hidden border border-white/10"
                  >

                    <img
                      src={image}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-70"
          >

            {loading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={22} />
                Submit Cleaning Request
              </>
            )}

          </button>

        </form>

      </div>

    </div>
  );
}

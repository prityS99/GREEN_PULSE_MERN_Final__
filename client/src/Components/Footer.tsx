
import Link from "next/link";

import { Leaf, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import Image from "next/image";
import footer from "../../public/footer.jpg"

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-green-950 via-emerald-900 to-black border-t border-green-700/20 w-full z-30 mt-0">
      {/* Ambient Glow */}
      {/* <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[120px]" /> */}

<div className="absolute inset-0 z-0">
        <Image
          src={footer}
          alt="Footer Background"
          fill
          priority
          className="object-cover object-center blur-[1px] scale-105 brightness-[0.25] contrast-[1.10]" 
        />
        {/* Rich dark gradient overlay blending into black */}
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90 z-4" />
      </div>
      {/* Ambient Glow Effects (Kept for extra depth on top of the image) */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/10 blur-[120px] z-10" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[120px] z-10" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16 z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-3 rounded-2xl">
                  <Leaf className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Green Pulse</h2>
                  <p className="text-green-300 text-sm">Eco Community Platform</p>
                </div>
              </div>
              <p className="text-gray-400 mt-6 leading-7">
                Bringing NGOs, volunteers, cleaning companies, and communities together for a cleaner future.
              </p>
              <div className="flex gap-4 mt-6">
                {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map((Icon, i) => (
                  <button key={i} className="bg-white/5 border border-green-700/20 hover:bg-green-500/20 p-3 rounded-2xl transition-all">
                    <Icon size={18} className="text-white" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-green-700/10">
              <Link href="/login" className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 shadow-lg shadow-green-500/20 w-fit">
                <ShieldCheck size={18} className="group-hover:rotate-6 transition-all" />
                Admin Login
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Quick Links</h3>
            <div className="flex flex-col gap-4">
              {["About Us", "Campaigns", "NGOs", "Volunteers", "Cleaning Companies"].map((item, i) => (
                <Link key={i} href="#" className="text-gray-400 hover:text-green-300 transition-all">{item}</Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Services</h3>
            <div className="flex flex-col gap-4">
              {["Waste Cleaning", "Tree Plantation", "Animal Shelter", "Awareness Campaign", "Volunteer Programs"].map((item, i) => (
                <p key={i} className="text-gray-400 hover:text-green-300 transition-all cursor-pointer">{item}</p>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Contact</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <Mail className="text-green-400 mt-1" size={18} />
                <p className="text-gray-400">support@greenpulse.com</p>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="text-green-400 mt-1" size={18} />
                <p className="text-gray-400">+91 2345689104</p>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="text-green-400 mt-1" size={18} />
                <p className="text-gray-400">Kolkata, West Bengal, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-green-700/20 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2026 Green Pulse. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


// // components/Footer.tsx
// "use client";

// import Link from "next/link";
// import Image from "next/image"; // Imported for the background picture
// import { Leaf, Mail, Phone, MapPin, ShieldCheck } from "lucide-react";
// import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from "react-icons/fa";
// import footer from "../../public/footer.jpg"

// export default function Footer() {
//   return (
//     <footer className="relative overflow-hidden w-full z-30 mt-0 border-t border-green-700/20">
      
//       {/* --- BLURRED BACKGROUND PICTURE --- */}
//      {/* --- UPDATED BACKGROUND PICTURE WITH LOWER BLUR --- */}
// <div className="absolute inset-0 z-0">
//   <Image
//     src={footer}
//     alt="Footer Background"
//     fill
//     priority
//     className="object-cover object-center blur-[3px] scale-105 brightness-[0.40] contrast-[1.05]" 
//     // blur-[3px] gives a micro-blur so shapes and colors are recognizable
//     // brightness-[0.40] opens up the lighting so you can see details clearly
//   />
//   {/* Soft gradient overlay to blend seamlessly with the rest of your app */}
//   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/90 z-10" />
// </div>

//       {/* Ambient Glow Effects (Kept for extra depth on top of the image) */}
//       <div className="absolute top-0 left-0 w-72 h-72 bg-green-500/10 blur-[120px] z-10" />
//       <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/10 blur-[120px] z-10" />

//       {/* Main Content Area */}
//       <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16 z-20">
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          
//           {/* Brand */}
//           <div className="flex flex-col justify-between">
//             <div>
//               <div className="flex items-center gap-3">
//                 <div className="bg-green-500 p-3 rounded-2xl shadow-lg shadow-green-500/20">
//                   <Leaf className="text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-2xl font-black text-white tracking-tight">Green Pulse</h2>
//                   <p className="text-green-300 text-sm font-medium">Eco Community Platform</p>
//                 </div>
//               </div>
//               <p className="text-gray-300/90 mt-6 leading-7 text-sm">
//                 Bringing NGOs, volunteers, cleaning companies, and communities together for a cleaner future.
//               </p>
//               <div className="flex gap-4 mt-6">
//                 {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map((Icon, i) => (
//                   <button key={i} className="bg-white/5 border border-white/10 hover:border-green-500/30 hover:bg-green-500/20 p-3 rounded-2xl transition-all duration-300 shadow-sm">
//                     <Icon size={18} className="text-white" />
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div className="mt-8 pt-6 border-t border-white/10">
//               <Link href="/login" className="group inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 shadow-lg shadow-green-500/20 w-fit">
//                 <ShieldCheck size={18} className="group-hover:rotate-6 transition-all" />
//                 Admin Login
//               </Link>
//             </div>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h3 className="text-xl font-bold text-white mb-6 tracking-wide">Quick Links</h3>
//             <div className="flex flex-col gap-4">
//               {["About Us", "Campaigns", "NGOs", "Volunteers", "Cleaning Companies"].map((item, i) => (
//                 <Link key={i} href="#" className="text-gray-400 hover:text-green-300 transition-all duration-200 text-sm font-medium">{item}</Link>
//               ))}
//             </div>
//           </div>

//           {/* Services */}
//           <div>
//             <h3 className="text-xl font-bold text-white mb-6 tracking-wide">Services</h3>
//             <div className="flex flex-col gap-4">
//               {["Waste Cleaning", "Tree Plantation", "Animal Shelter", "Awareness Campaign", "Volunteer Programs"].map((item, i) => (
//                 <p key={i} className="text-gray-400 hover:text-green-300 transition-all cursor-pointer text-sm font-medium">{item}</p>
//               ))}
//             </div>
//           </div>

//           {/* Contact */}
//           <div>
//             <h3 className="text-xl font-bold text-white mb-6 tracking-wide">Contact</h3>
//             <div className="space-y-5 text-sm">
//               <div className="flex items-start gap-4">
//                 <Mail className="text-green-400 mt-0.5" size={18} />
//                 <p className="text-gray-300">support@greenpulse.com</p>
//               </div>
//               <div className="flex items-start gap-4">
//                 <Phone className="text-green-400 mt-0.5" size={18} />
//                 <p className="text-gray-300">+91 2345689104</p>
//               </div>
//               <div className="flex items-start gap-4">
//                 <MapPin className="text-green-400 mt-0.5" size={18} />
//                 <p className="text-gray-300 leading-6">Kolkata, West Bengal, India</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Copyright Bottom line */}
//         <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
//           <p className="text-gray-500 text-sm">© 2026 Green Pulse. All rights reserved.</p>
//           <div className="flex gap-6 text-sm text-gray-500">
//             <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
//             <Link href="#" className="hover:text-gray-300 transition-colors">Terms & Conditions</Link>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    Trees,
    Sprout,
    Calendar,
    MapPin,
    HeartHandshake,
    Globe2,
    TrendingUp,
    ShieldCheck,
    ArrowRight,
    Award
} from "lucide-react";
import Link from "next/link";

// Animation Presets
// Add "as const" at the end of the object
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
} as const;

const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
} as const;

export default function TreePlantationPage() {
    return (
        <main className="bg-black text-white overflow-hidden">
            
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center">
                <Image
                    src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09"
                    alt="Hands holding a small sprout in soil"
                    fill
                    priority
                    className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-emerald-950/70 to-black" />

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10 max-w-6xl px-6 text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2 text-emerald-300 mb-6">
                        <Sprout size={18} />
                        Roots for Tomorrow
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                        Planting Trees,
                        <span className="block bg-gradient-to-r from-emerald-300 via-green-400 to-teal-300 bg-clip-text text-transparent">
                            Restoring Ecosystems
                        </span>
                    </h1>

                    <p className="mt-8 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                        Join our global reforestation initiative. We bridge the gap between enthusiastic volunteers, 
                        eco-conscious corporations, and localized planting projects to rebuild our planet's green canopy.
                    </p>
                    <Link
                        href="/login"
                        className="mt-10 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-4 font-semibold text-black transition hover:bg-emerald-400"
                    >
                        Plant Your First Tree
                        <ArrowRight size={20} />
                    </Link>
                </motion.div>
            </section>

            {/* Core Mission */}
            <section className="py-24 px-6">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="max-w-6xl mx-auto text-center"
                >
                    <h2 className="text-4xl font-bold mb-8">
                        Why We Plant
                    </h2>

                    <p className="text-gray-300 text-lg max-w-4xl mx-auto leading-relaxed">
                        Deforestation accounts for nearly 15% of global greenhouse gas emissions. Through strategic 
                        biodiversity-focused planting, we don't just put seeds in the ground—we nurture permanent, 
                        self-sustaining forests that capture carbon, purify groundwater, and provide habitats for endangered species.
                    </p>
                </motion.div>
            </section>

            {/* Corporate/NGO Partnership Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2"
                            alt="Group of volunteers planting trees together"
                            width={800}
                            height={600}
                            className="rounded-3xl shadow-2xl"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 text-emerald-400 mb-5">
                            <HeartHandshake />
                            <span>Community & Corporate Synergy</span>
                        </div>

                        <h2 className="text-4xl font-bold mb-6">
                            Scalable Reforestation Programs
                        </h2>

                        <p className="text-gray-300 leading-relaxed text-lg mb-6">
                            Whether you are an individual looking to plant a single sapling for a loved one, an NGO 
                            coordinating a local reserve project, or a corporation aiming to offset your scope emissions, 
                            Green Pulse Pro handles the logistics, site selection, and long-term sapling maintenance.
                        </p>
                        
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-center gap-3"><MapPin size={18} className="text-emerald-400" /> Tracked geo-locations for every block planted</li>
                            <li className="flex items-center gap-3"><Award size={18} className="text-emerald-400" /> Transparent survival rate reporting (Targeting 85%+)</li>
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 px-6 bg-gradient-to-b from-emerald-950/20 to-transparent">
                <div className="max-w-7xl mx-auto">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center text-4xl font-bold mb-16"
                    >
                        Our Modern Approach
                    </motion.h2>

                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        <motion.div variants={fadeInUp} className="rounded-3xl bg-white/5 border border-emerald-500/10 p-8 hover:border-emerald-500/30 transition-colors duration-300">
                            <Calendar className="text-teal-400 mb-4" size={40} />
                            <h3 className="text-2xl font-bold mb-4">
                                Seasonal Drives
                            </h3>
                            <p className="text-gray-300">
                                We host heavily coordinated planting events during optimal regional monsoons and rainfall seasons to ensure natural survival rates.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="rounded-3xl bg-white/5 border border-emerald-500/10 p-8 hover:border-emerald-500/30 transition-colors duration-300">
                            <Trees className="text-emerald-400 mb-4" size={40} />
                            <h3 className="text-2xl font-bold mb-4">
                                Native Species Only
                            </h3>
                            <p className="text-gray-300">
                                Monoculture plantations hurt ecosystems. We select custom mixes of native flora that actively benefit local insects, birds, and soil biomes.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="rounded-3xl bg-white/5 border border-emerald-500/10 p-8 hover:border-emerald-500/30 transition-colors duration-300">
                            <TrendingUp className="text-green-400 mb-4" size={40} />
                            <h3 className="text-2xl font-bold mb-4">
                                Carbon Tracking
                            </h3>
                            <p className="text-gray-300">
                                Monitor your real-time carbon offsets. Watch your small contribution scale into blocks of carbon-sequestering mature canopies over time.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Real-time Reforestation Stats */}
            <section className="py-24 px-6">
                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8"
                >
                    {[
                        { icon: Sprout, value: "450K+", label: "Saplings Planted" },
                        { icon: Calendar, value: "120+", label: "Active Drives Yearly" },
                        { icon: Globe2, value: "25+", label: "Protected Bio-zones" },
                        { icon: TrendingUp, value: "3.2M", label: "Kgs CO2 Sequestered" },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className="rounded-3xl bg-white/5 border border-emerald-500/10 p-8 text-center"
                        >
                            <item.icon
                                size={40}
                                className="mx-auto text-emerald-400 mb-4"
                            />
                            <h3 className="text-4xl font-bold">
                                {item.value}
                            </h3>
                            <p className="mt-2 text-gray-400">
                                {item.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Landscape Vision Banner */}
            <section className="relative py-32 overflow-hidden">
                {/* Slow Zoom Motion on the background image */}
                <motion.div 
                    initial={{ scale: 1 }}
                    whileInView={{ scale: 1.1 }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="absolute inset-0 w-full h-full"
                >
                    <Image
                        src="https://images.unsplash.com/photo-1502082553048-f009c37129b9"
                        alt="Sunbeams cutting through a deep, healthy forest canopy"
                        fill
                        className="object-cover"
                    />
                </motion.div>

                <div className="absolute inset-0 bg-black/70" />

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10 max-w-4xl mx-auto text-center px-6"
                >
                    <Trees
                        className="mx-auto text-emerald-400 mb-6"
                        size={60}
                    />

                    <h2 className="text-5xl font-bold mb-6">
                        Reviving the Lost Canopy
                    </h2>

                    <p className="text-xl text-gray-200">
                        Our ultimate dream goes beyond individual trees. We are stitching fragmented forests 
                        back together, enabling wildlife migration paths to heal and natural water cycles to thrive again.
                    </p>
                </motion.div>
            </section>

            {/* Call To Action */}
            <section className="py-28 px-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto rounded-[40px] bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-500/20 p-12 text-center"
                >
                    <ShieldCheck
                        className="mx-auto text-emerald-400 mb-6"
                        size={60}
                    />

                    <h2 className="text-5xl font-bold mb-6">
                        Leave A Lasting Legacy
                    </h2>

                    <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                        A society grows great when old men plant trees in whose shade they shall never sit. 
                        Take your step today and gift a breathing forest to generations yet unborn.
                    </p>
                    
                    <Link href="donation">
                        <button className="mt-10 rounded-full bg-emerald-500 px-8 py-4 font-semibold text-black hover:bg-emerald-400 transition">
                            Join by Donating for Better Earth
                        </button>
                    </Link>
                </motion.div>
            </section>
        </main>
    );
}
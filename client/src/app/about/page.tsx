"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import {
    Leaf,
    Recycle,
    Users,
    Building2,
    Globe2,
    Trees,
    Wind,
    Droplets,
    ShieldCheck,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";

// TypeScript-safe Animation Variants
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

export default function AboutPage() {
    return (
        <main className="bg-black text-white overflow-hidden">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center">
                <Image
                    src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e"
                    alt="Forest"
                    fill
                    priority
                    className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-green-950/70 to-black" />

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10 max-w-6xl px-6 text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-5 py-2 text-green-300 mb-6">
                        <Leaf size={18} />
                        Green Pulse
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                        Creating A
                        <span className="block bg-gradient-to-r from-green-300 via-emerald-400 to-lime-300 bg-clip-text text-transparent">
                            Cleaner Future
                        </span>
                    </h1>

                    <p className="mt-8 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                        Connecting NGOs, Cleaning Companies, Volunteers and Communities
                        to drive environmental impact and sustainable change.
                    </p>
                    <Link
                        href="/login"
                        className="mt-10 inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-4 font-semibold text-black transition hover:bg-green-400"
                    >
                        Join The Movement
                        <ArrowRight size={20} />
                    </Link>
                </motion.div>
            </section>

            {/* Mission */}
            <section className="py-24 px-6">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeInUp}
                    className="max-w-6xl mx-auto text-center"
                >
                    <h2 className="text-4xl font-bold mb-8">
                        Our Mission
                    </h2>

                    <p className="text-gray-300 text-lg max-w-4xl mx-auto leading-relaxed">
                        Green Pulse Pro empowers environmental organizations,
                        cleaning companies, volunteers, and citizens through
                        technology-driven collaboration. Together we transform
                        awareness into measurable environmental action.
                    </p>
                </motion.div>
            </section>

            {/* NGO Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a"
                            alt="NGO Volunteers"
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
                        <div className="flex items-center gap-3 text-green-400 mb-5">
                            <Users />
                            <span>Environmental NGOs</span>
                        </div>

                        <h2 className="text-4xl font-bold mb-6">
                            Empowering Organizations
                        </h2>

                        <p className="text-gray-300 leading-relaxed text-lg">
                            NGOs are the backbone of environmental change.
                            Green Pulse Pro helps organizations launch campaigns,
                            recruit volunteers, organize cleanup drives, track
                            environmental impact, and inspire communities.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Cleaning Companies */}
            <section className="py-24 px-6 bg-gradient-to-b from-green-950/20 to-transparent">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="order-2 lg:order-1"
                    >
                        <div className="flex items-center gap-3 text-emerald-400 mb-5">
                            <Building2 />
                            <span>Cleaning Companies</span>
                        </div>

                        <h2 className="text-4xl font-bold mb-6">
                            Driving Cleaner Communities
                        </h2>

                        <p className="text-gray-300 leading-relaxed text-lg">
                            Professional cleaning companies are vital for
                            sustainable communities. Our platform enables them
                            to receive requests, partner with NGOs, and take
                            part in environmental restoration initiatives.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="order-1 lg:order-2"
                    >
                        <Image
                            src="https://images.unsplash.com/photo-1528323273322-d81458248d40"
                            alt="Cleaning Team"
                            width={800}
                            height={600}
                            className="rounded-3xl shadow-2xl"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Pollution Awareness */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center text-4xl font-bold mb-16"
                    >
                        Environmental Challenges
                    </motion.h2>

                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        <motion.div variants={fadeInUp} className="rounded-3xl bg-white/5 border border-green-500/10 p-8 hover:border-green-500/30 transition-colors duration-300">
                            <Wind className="text-sky-400 mb-4" size={40} />
                            <h3 className="text-2xl font-bold mb-4">
                                Air Pollution
                            </h3>
                            <p className="text-gray-300">
                                Harmful emissions from industries and vehicles
                                affect health, ecosystems, and climate.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="rounded-3xl bg-white/5 border border-green-500/10 p-8 hover:border-green-500/30 transition-colors duration-300">
                            <Droplets className="text-cyan-400 mb-4" size={40} />
                            <h3 className="text-2xl font-bold mb-4">
                                Water Pollution
                            </h3>
                            <p className="text-gray-300">
                                Plastic waste and chemicals threaten rivers,
                                oceans, and aquatic biodiversity.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="rounded-3xl bg-white/5 border border-green-500/10 p-8 hover:border-green-500/30 transition-colors duration-300">
                            <Recycle className="text-green-400 mb-4" size={40} />
                            <h3 className="text-2xl font-bold mb-4">
                                Land Pollution
                            </h3>
                            <p className="text-gray-300">
                                Improper waste disposal degrades soil quality
                                and destroys wildlife habitats.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-24 px-6">
                <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8"
                >
                    {[
                        { icon: Trees, value: "10K+", label: "Trees Protected" },
                        { icon: Users, value: "5K+", label: "Volunteers" },
                        { icon: Building2, value: "500+", label: "Organizations" },
                        { icon: Globe2, value: "100%", label: "Eco Focused" },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className="rounded-3xl bg-white/5 border border-green-500/10 p-8 text-center"
                        >
                            <item.icon
                                size={40}
                                className="mx-auto text-green-400 mb-4"
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

            {/* Vision Banner */}
            <section className="relative py-32 overflow-hidden">
                {/* Slow Zoom Motion on the background image */}
                <motion.div 
                    initial={{ scale: 1 }}
                    whileInView={{ scale: 1.08 }}
                    transition={{ duration: 12, ease: "linear" as const }}
                    className="absolute inset-0 w-full h-full"
                >
                    <Image
                        src="https://images.unsplash.com/photo-1466611653911-95081537e5b7"
                        alt="Earth"
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
                    <Globe2
                        className="mx-auto text-green-400 mb-6"
                        size={60}
                    />

                    <h2 className="text-5xl font-bold mb-6">
                        Our Vision
                    </h2>

                    <p className="text-xl text-gray-200">
                        A future where technology, communities, NGOs,
                        businesses, and volunteers work together to
                        protect nature and build a sustainable world.
                    </p>
                </motion.div>
            </section>

            {/* CTA */}
            <section className="py-28 px-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-5xl mx-auto rounded-[40px] bg-gradient-to-r from-green-900/50 to-emerald-900/50 border border-green-500/20 p-12 text-center"
                >
                    <ShieldCheck
                        className="mx-auto text-green-400 mb-6"
                        size={60}
                    />

                    <h2 className="text-5xl font-bold mb-6">
                        Together We Can Make A Difference
                    </h2>

                    <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                        Every cleanup drive, every volunteer effort,
                        and every environmental campaign brings us
                        closer to a healthier and greener future.
                    </p>
                    <Link href="/login">
                        <button className="mt-10 rounded-full bg-green-500 px-8 py-4 font-semibold text-black hover:bg-green-400 transition">
                            Join Green Pulse Pro
                        </button>
                    </Link>
                </motion.div>
            </section>
        </main>
    );
}
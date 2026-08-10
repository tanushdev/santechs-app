"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 10000, suffix: "+", label: "Products Listed", description: "Across all categories" },
  { value: 2500, suffix: "+", label: "Verified Sellers", description: "Vetted by our team" },
  { value: 50000, suffix: "+", label: "Registered Buyers", description: "From 40+ countries" },
  { value: 98, suffix: "%", label: "Satisfaction Rate", description: "Buyer feedback" },
];

function AnimatedCounter({
  value,
  suffix,
}: {
  value: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section className="py-24 bg-[#faf9f6] border-y border-[#e5e7eb] relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(oklch(0 0 0) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#75758a] font-bold">
            Platform Metrics
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-black font-sans mt-2 mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Numbers that reflect our commitment to connecting buyers and sellers
            across the textile and recycling industry worldwide.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white border border-[#e5e7eb] rounded-2xl p-8 text-center hover:border-slate-350 hover:shadow-xs transition-all duration-300"
            >
              <div className="text-3xl sm:text-4xl font-normal text-[#ff7759] font-sans mt-1 mb-3">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-slate-900 font-bold text-sm mb-1">{stat.label}</div>
              <div className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

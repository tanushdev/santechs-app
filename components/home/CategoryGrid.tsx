"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Settings, Leaf, Wrench, Briefcase, ArrowRight } from "lucide-react";

const categories = [
  {
    id: "machines",
    icon: Settings,
    label: "Machines",
    description: "DTY, FDY, POY, spinning, and texturizing systems.",
    href: "/products?type=MACHINE",
    count: "5,000+ items",
    subcategories: ["DTY", "FDY", "POY", "Spinning"],
  },
  {
    id: "raw-materials",
    icon: Leaf,
    label: "Raw Materials",
    description: "PET flakes, chips, films, and yarn polymers.",
    href: "/products?type=RAW_MATERIAL",
    count: "2,000+ items",
    subcategories: ["PET Flakes", "Chips", "Films", "Polymer"],
  },
  {
    id: "spare-parts",
    icon: Wrench,
    label: "Spare Parts",
    description: "Godet rolls, filter screen changers, and spindles.",
    href: "/products?type=SPARE_PART",
    count: "1,500+ items",
    subcategories: ["Godet Rolls", "Filter Screens", "Spindles"],
  },
  {
    id: "services",
    icon: Briefcase,
    label: "Services",
    description: "Consultation, installation, and relocation support.",
    href: "/products?type=SERVICE",
    count: "500+ service provider listings",
    subcategories: ["Installation", "Relocation", "Inspection"],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CategoryGrid() {
  return (
    <section className="py-24 bg-white border-b border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-16 space-y-3">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#ff7759] font-bold">
            Catalog Segmentation
          </div>
          <h2 className="text-4xl lg:text-5xl font-normal tracking-[-0.03em] text-black font-sans leading-none">
            Browse by Industrial Category
          </h2>
          <p className="text-slate-500 text-sm max-w-xl leading-relaxed">
            Explore verified listings spanning manufacturing machinery, raw recycled feedstocks, precision spare parts, and support services.
          </p>
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {categories.map((cat) => (
            <motion.div key={cat.id} variants={item} className="h-full">
              <Link href={cat.href} className="group block h-full">
                <div className="bg-[#eeece7]/40 border border-[#e5e7eb] rounded-2xl p-6 h-full flex flex-col justify-between hover:border-black hover:bg-[#eeece7]/60 transition-all duration-200">
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#e5e7eb] flex items-center justify-center text-black">
                      <cat.icon className="w-5 h-5 stroke-[1.5]" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-black font-sans tracking-tight">{cat.label}</h3>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">{cat.count}</p>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Subcategories */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {cat.subcategories.map((sub) => (
                        <span
                          key={sub}
                          className="text-[10px] font-semibold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-[#e5e7eb] text-slate-500"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Action Text Link style */}
                  <div className="flex items-center text-xs font-bold uppercase tracking-wider text-black pt-6 group-hover:underline">
                    Explore Listings
                    <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}

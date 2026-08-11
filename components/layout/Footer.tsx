import Link from "next/link";
import { Factory, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  marketplace: [
    { label: "All Products", href: "/products" },
    { label: "Machinery", href: "/products?type=MACHINE" },
    { label: "Raw Materials", href: "/products?type=RAW_MATERIAL" },
    { label: "Spare Parts", href: "/products?type=SPARE_PART" },
  ],
  forSellers: [
    { label: "Sell on Santechs", href: "/sell" },
    { label: "Seller Guidelines", href: "/guidelines" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const categories = [
  "DTY Machines", "FDY Machines", "POY Machines", "Spinning Machines",
  "PET Flakes", "PET Chips", "Recycling Plants", "Godet Rolls",
];

export default function Footer() {
  return (
    <footer className="bg-sidebar text-sidebar-foreground">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-3">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg orange-gradient flex items-center justify-center">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold font-heading">
                San<span className="text-primary">techs</span>
              </span>
            </Link>
            <p className="text-sm text-sidebar-foreground/60 leading-relaxed mb-6">
              India&apos;s premier B2B marketplace for textile machinery, recycling
              plants, raw materials, and spare parts. Connecting verified sellers
              with global buyers through the trusted Santechs platform.
            </p>
            <div className="space-y-2">
              <a
                href="tel:+919167655133"
                className="flex items-center gap-2 text-sm text-sidebar-foreground/60 hover:text-primary transition-colors"
              >
                <Phone className="w-4 h-4" />
                +91 91676 55133
              </a>
              <a
                href="mailto:Sales@santechs.net"
                className="flex items-center gap-2 text-sm text-sidebar-foreground/60 hover:text-primary transition-colors"
              >
                <Mail className="w-4 h-4" />
                Sales@santechs.net
              </a>
              <div className="flex items-start gap-2 text-sm text-sidebar-foreground/60">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Office No A 154, Balaji Bhavan, Sector 11, Plot no.42A, Cbd Belapur, Navi Mumbai, Maharashtra, India - 400614
                </span>
              </div>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-semibold font-heading mb-4 text-sidebar-foreground">
              Marketplace
            </h4>
            <ul className="space-y-2">
              {footerLinks.marketplace.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="font-semibold font-heading mb-4 text-sidebar-foreground">
              For Sellers
            </h4>
            <ul className="space-y-2">
              {footerLinks.forSellers.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>



          {/* Company */}
          <div>
            <h4 className="font-semibold font-heading mb-4 text-sidebar-foreground">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-foreground/60 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>


      </div>

      {/* Bottom Bar */}
      <div className="border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-sidebar-foreground/40">
            © {new Date().getFullYear()} Santechs. All rights reserved.
          </p>
          <p className="text-xs text-sidebar-foreground/40">
            Made in India 🇮🇳 — B2B Industrial Marketplace
          </p>
        </div>
      </div>
    </footer>
  );
}

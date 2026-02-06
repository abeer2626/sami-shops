import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#2e2e2e] text-gray-300 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Customer Care */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-6">Customer Care</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">How to Buy</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Purchase Protection</Link></li>
                        </ul>
                    </div>

                    {/* SamiShops */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-6">SamiShops</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Digital Payments</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">SamiShops Donates</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Social & Mobile App */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-6">Follow Us</h3>
                        <div className="flex gap-4 mb-8">
                            <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors hover:text-white">
                                <Facebook size={20} />
                            </Link>
                            <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors hover:text-white">
                                <Twitter size={20} />
                            </Link>
                            <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors hover:text-white">
                                <Instagram size={20} />
                            </Link>
                            <Link href="#" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors hover:text-white">
                                <Youtube size={20} />
                            </Link>
                        </div>
                    </div>

                    {/* Newsletter / Contact */}
                    <div>
                        <h3 className="text-white text-lg font-bold mb-6">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin size={20} className="text-primary mt-1 flex-shrink-0" />
                                <span>123 Tech Avenue, Software Park, SamiCity, World</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={20} className="text-primary flex-shrink-0" />
                                <span>+1 (234) 567-890</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={20} className="text-primary flex-shrink-0" />
                                <span>support@samishops.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-8 flex flex-col md:row justify-between items-center gap-4 text-xs">
                    <p>© {currentYear} SamiShops. All Rights Reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white">Terms of Service</Link>
                        <Link href="#" className="hover:text-white">Cookie Settings</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

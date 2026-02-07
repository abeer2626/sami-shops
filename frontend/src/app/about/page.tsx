import { Shield, Target, Eye, ShoppingBag, Globe, Award } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">About Sami’s Marketplace</h1>
                    <p className="max-w-3xl mx-auto text-blue-100 text-lg md:text-xl font-medium leading-relaxed">
                        A modern, multi-vendor eCommerce platform built to deliver a reliable, transparent, and scalable online shopping experience.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto space-y-16">

                    {/* Introduction */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Globe size={28} className="text-accent" />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Who We Are</h2>
                        </div>
                        <div className="text-gray-600 space-y-4 leading-loose text-lg">
                            <p>
                                <strong>Sami’s Marketplace</strong> is a modern, multi-vendor eCommerce platform built to deliver a reliable, transparent, and scalable online shopping experience. Designed with both customers and sellers in mind, Sami’s connects quality products, trusted vendors, and efficient technology under one unified marketplace.
                            </p>
                            <p>
                                Our platform empowers vendors to grow their businesses while giving customers access to a wide range of products, competitive pricing, and secure transactions — all within a clean, user-friendly interface inspired by leading global marketplaces.
                            </p>
                            <p>
                                At Sami’s, we believe in <strong>trust, performance, and long-term value</strong>. Every feature is built with scalability, security, and simplicity at its core.
                            </p>
                        </div>
                    </div>

                    {/* Mission & Vision Grid */}
                    <div className="grid md:grid-cols-2 gap-12">
                        <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-primary/10 transition-transform group-hover:scale-110">
                                <Target size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <Target className="text-primary" /> Our Mission
                                </h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    Our mission is to build a <strong>trusted digital marketplace</strong> where buyers shop with confidence and sellers scale without friction. We focus on technology-driven solutions that simplify commerce while maintaining transparency and control for all stakeholders.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-10 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-accent/10 transition-transform group-hover:scale-110">
                                <Eye size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <Eye className="text-accent" /> Our Vision
                                </h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    To become a <strong>reliable, growth-oriented marketplace</strong> that supports vendors of all sizes and delivers a seamless shopping experience across devices, regions, and categories.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What We Offer */}
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">What We Offer</h2>
                            <div className="w-20 h-1.5 bg-accent mx-auto"></div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: "Multi-vendor platform", icon: ShoppingBag, desc: "A diverse collection of products from verified sellers." },
                                { title: "Secure Checkout", icon: Shield, desc: "Industry-standard encryption for all your transactions." },
                                { title: "Order Tracking", icon: Globe, desc: "Real-time updates on your orders from warehouse to doorstep." },
                                { title: "Transparent Pricing", icon: Award, desc: "Fair commission structure and no hidden charges for anyone." },
                                { title: "Scalable Growth", icon: Target, desc: "Built with the latest tech to grow as your business scales." },
                                { title: "Admin Oversight", icon: Shield, desc: "Quality control and vendor management for a safe ecosystem." }
                            ].map((item, idx) => (
                                <div key={idx} className="p-6 border border-gray-100 rounded-2xl hover:border-primary/20 hover:shadow-lg transition-all group">
                                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <item.icon size={24} />
                                    </div>
                                    <h4 className="font-black uppercase tracking-tight mb-2 text-sm">{item.title}</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legal/Trust Statement */}
                    <div className="bg-primary/5 border border-primary/10 p-8 rounded-2xl text-center">
                        <Shield className="mx-auto text-primary mb-4" size={32} />
                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">Legal & Trust Statement</h3>
                        <p className="text-gray-600 max-w-2xl mx-auto text-sm leading-relaxed">
                            Sami’s Marketplace operates with a strong commitment to transparency, data security, and platform integrity. All activities are monitored and governed to ensure a safe and reliable experience for users and vendors.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

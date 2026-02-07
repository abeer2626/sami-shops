import { ShieldCheck, Truck, Scale, Lock, UserCheck, ScrollText } from "lucide-react";

export default function TermsPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-100 py-16">
                <div className="container mx-auto px-4 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-6">
                        <ScrollText size={32} />
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-gray-900 mb-4 italic">Terms & <span className="text-primary italic">Conditions</span></h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Last Updated: February 2026 &bull; Sami’s Marketplace Official</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <div className="space-y-12">
                    {/* Introduction */}
                    <div className="space-y-4">
                        <p className="text-gray-600 leading-loose">
                            Welcome to <strong>Sami’s Marketplace</strong>. By accessing this website, we assume you accept these terms and conditions. Do not continue to use Sami’s Marketplace if you do not agree to take all of the terms and conditions stated on this page.
                        </p>
                    </div>

                    {/* Section 1: Marketplace Integrity */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-primary" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">1. Marketplace Integrity</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Sami’s Marketplace is a multi-vendor platform. While we strive to verify all vendors, the platform acts as a facilitator. We ensure that every vendor follows the "Sami's Quality Standard" to maintain trust and transparency.
                        </p>
                    </div>

                    {/* Section 2: Payments & Commissions */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Scale className="text-primary" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">2. Payments & Commissions</h2>
                        </div>
                        <ul className="list-disc list-inside space-y-3 text-sm text-gray-600">
                            <li>All transactions are processed through Sami's secure payment gateway.</li>
                            <li>Vendors agree to the fixed commission structure as outlined in the Vendor Portal.</li>
                            <li>Pricing must remain transparent with no hidden customer charges.</li>
                        </ul>
                    </div>

                    {/* Section 3: Delivery & Fulfillment */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Truck className="text-primary" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">3. Delivery & Fulfillment</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Fulfillment is handled by independent vendors but monitored by Sami’s logistics oversight team. Fast delivery within Pakistan is our priority, and vendors are required to ship within 48 hours of order confirmation.
                        </p>
                    </div>

                    {/* Section 4: User Accounts */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <UserCheck className="text-primary" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">4. User Accounts</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            Users are responsible for maintaining the confidentiality of their account details. Sami’s Marketplace reserves the right to terminate accounts that violate platform policies or engage in fraudulent activities.
                        </p>
                    </div>

                    {/* Section 5: Professional Conduct */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Lock className="text-primary" size={24} />
                            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">5. Professional Conduct</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm italic border-l-4 border-primary pl-6 py-2 bg-gray-50 rounded-r-xl">
                            "Transparency and trust are the pillars of Sami’s Marketplace. Any attempt to bypass platform security or provide false information will result in immediate suspension."
                        </p>
                    </div>

                    {/* Footer Contact Reminder */}
                    <div className="bg-primary text-white p-8 rounded-3xl text-center space-y-4 shadow-xl shadow-primary/20">
                        <h3 className="font-black uppercase tracking-tight">Need Clarification?</h3>
                        <p className="text-blue-100 text-sm">If you have any questions regarding our terms, please contact our legal team.</p>
                        <a href="mailto:samiecom2626@gmail.com" className="inline-block bg-white text-primary px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-accent hover:text-white transition-all">
                            Contact Legal Team
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

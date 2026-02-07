import { Mail, Phone, MapPin, Clock, MessageSquare, ShieldCheck, Globe } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="bg-primary py-20 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">Contact Us</h1>
                    <p className="max-w-3xl mx-auto text-blue-100 text-lg md:text-xl font-medium leading-relaxed">
                        Have questions about Sami’s Marketplace? Our dedicated support team is here to help customers and vendors 24/7.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">

                    {/* Contact Information */}
                    <div className="space-y-12">
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-6 italic">Get In <span className="text-primary">Touch</span></h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                At Sami’s, we value professional and transparent communication. Whether you are looking for order support, vendor onboarding, or general inquiries, use the channels below to reach our Karachi-based headquarters.
                            </p>
                        </div>

                        <div className="space-y-8">
                            {/* Location */}
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-gray-100">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-xs text-gray-400 mb-1">Our Headquarters</h3>
                                    <p className="text-gray-900 font-bold">KARACHI, <span className="text-green-600">PAKISTAN</span></p>
                                    <p className="text-gray-500 text-sm mt-1">Sami's Marketplace Main Operations Center</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-gray-100">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-xs text-gray-400 mb-1">Direct Hotline</h3>
                                    <a href="tel:03128446585" className="text-gray-900 font-bold block hover:text-primary transition-colors text-lg">03128446585</a>
                                    <p className="text-gray-500 text-sm mt-1">Available for urgent order inquiries</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-gray-100">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-xs text-gray-400 mb-1">Official Email</h3>
                                    <a href="mailto:samiecom2626@gmail.com" className="text-gray-900 font-bold block hover:text-primary transition-colors">samiecom2626@gmail.com</a>
                                    <p className="text-gray-500 text-sm mt-1">For business and vendor partnerships</p>
                                </div>
                            </div>

                            {/* Hours */}
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-gray-100">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-widest text-xs text-gray-400 mb-1">Working Hours</h3>
                                    <p className="text-gray-900 font-bold">24/7 Digital Operations</p>
                                    <p className="text-gray-500 text-sm mt-1">Customer support available Mon-Sat (9AM - 9PM)</p>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex items-center gap-6">
                            <ShieldCheck className="text-primary hidden sm:block" size={40} />
                            <div>
                                <h4 className="font-black uppercase tracking-tight text-sm text-gray-900 mb-1 italic">Professional Integrity</h4>
                                <p className="text-xs text-gray-500 font-medium">Every inquiry is logged and processed by Sami’s priority management team to ensure 100% resolution.</p>
                            </div>
                        </div>
                    </div>

                    {/* Modern WhatsApp CTA */}
                    <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col justify-center items-center text-center space-y-8 relative overflow-hidden group">
                        {/* Background Decoration */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors duration-500" />

                        <div className="w-24 h-24 bg-green-500/10 rounded-3xl flex items-center justify-center text-green-600 relative">
                            <div className="absolute inset-0 bg-green-500/20 rounded-3xl animate-ping scale-75 opacity-20" />
                            <MessageSquare size={48} className="relative drop-shadow-sm" />
                        </div>

                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                Online Now
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tight text-gray-900 italic">Chat with <span className="text-green-600">Sami’s</span></h3>
                            <p className="text-gray-600 font-medium leading-relaxed max-w-sm mx-auto">
                                Skip the email queue. Connect directly with our priority support team on WhatsApp for instant assistance.
                            </p>
                        </div>

                        <a
                            href="https://wa.me/923128446585"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-green-600 text-white font-black py-6 rounded-2xl shadow-xl shadow-green-600/30 hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-4 relative z-10"
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="w-6 h-6 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.405 0 0 5.403 0 12.05c0 2.125.556 4.2 1.61 6.062L0 24l6.095-1.599a11.771 11.771 0 005.95 1.599h.005c6.642 0 12.046-5.405 12.048-12.05a11.79 11.79 0 00-3.483-8.52z" />
                            </svg>
                            Launch WhatsApp Chat
                        </a>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            Sami’s Priority Support
                            <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

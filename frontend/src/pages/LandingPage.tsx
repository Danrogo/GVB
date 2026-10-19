import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '../services/services.api';
import { reviewsApi } from '../services/reviews.api';
import ServiceCard from '../components/ServiceCard';
import ReviewCard from '../components/ReviewCard';
import LoadingSpinner from '../components/LoadingSpinner';

const LandingPage = () => {
    const { data: services, isLoading: servicesLoading } = useQuery({
        queryKey: ['services'],
        queryFn: servicesApi.getAll,
    });

    const { data: reviews } = useQuery({
        queryKey: ['reviews'],
        queryFn: reviewsApi.getAll,
    });

    const featuredServices = services?.filter((s) => s.IsActive).slice(0, 6) ?? [];
    const approvedReviews = reviews?.filter((r) => r.IsApproved).slice(0, 3) ?? [];

    return (
        <div className="min-h-screen">
            {/* ── Hero ── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 gvb-gradient opacity-95" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1400&h=900&fit=crop')] bg-cover bg-center opacity-10" />

                {/* Decorative circles */}
                <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-secondary/20 blur-3xl animate-float" />
                <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-white/10 blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
                    <div className="badge badge-secondary badge-lg mb-6 font-medium px-4 py-3 rounded-full text-xs uppercase tracking-widest">
                        ✨ Where Beauty Meets Excellence
                    </div>
                    <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Good Vibes{' '}
                        <span className="italic text-secondary">Beauty</span>
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                        Professional nail artistry in Embu Gakwegori. From gel application to 3D art designs — we bring your nail dreams to life.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/book"
                            className="btn btn-secondary btn-lg rounded-2xl font-bold px-10 shadow-2xl hover:scale-105 transition-transform"
                        >
                            Book Appointment 💅
                        </Link>
                        <Link
                            to="/services"
                            className="btn btn-outline btn-lg rounded-2xl font-semibold text-white border-white/50 hover:bg-white/10 hover:border-white px-10"
                        >
                            Our Services
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-8 mt-16">
                        {[
                            { value: '500+', label: 'Happy Clients' },
                            { value: '2mo', label: 'Course Duration' },
                            { value: '10k', label: 'For 8 Weeks' },
                            { value: '5★', label: 'Rating' },
                        ].map((stat) => (
                            <div key={stat.label} className="gvb-glass rounded-2xl px-6 py-4 text-center">
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-white/60 text-xs uppercase tracking-wide mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </section>

            {/* ── Services ── */}
            <section className="py-24 px-4 bg-base-200">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="badge badge-primary badge-outline mb-4 px-4 py-2 rounded-full uppercase tracking-wider text-xs">
                            What We Offer
                        </span>
                        <h2 className="font-display text-4xl font-bold text-base-content">
                            Our <span className="text-primary italic">Services</span>
                        </h2>
                        <p className="text-base-content/60 mt-3 max-w-xl mx-auto">
                            Premium nail services crafted with love and expertise
                        </p>
                    </div>
                    {servicesLoading ? (
                        <LoadingSpinner />
                    ) : featuredServices.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredServices.map((service) => (
                                <ServiceCard key={service.ServiceId} service={service} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-5xl mb-4">💅</p>
                            <p className="text-base-content/50">Services coming soon!</p>
                        </div>
                    )}
                    <div className="text-center mt-10">
                        <Link to="/services" className="btn btn-primary btn-wide rounded-2xl font-semibold">
                            View All Services
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Why GVB ── */}
            <section className="py-24 px-4 bg-base-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="font-display text-4xl font-bold text-base-content">
                            Why Choose <span className="text-primary italic">Us?</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🎓',
                                title: 'Professional Training',
                                desc: '2-month beginner nail class covering everything from prep to 3D art designs.',
                            },
                            {
                                icon: '💎',
                                title: 'Premium Products',
                                desc: 'We use top-quality nail tools and products from trusted vendors.',
                            },
                            {
                                icon: '📍',
                                title: 'Conveniently Located',
                                desc: 'Find us in Embu Gakwegori (G-town) — easily accessible for all clients.',
                            },
                        ].map((item) => (
                            <div
                                key={item.title}
                                className="card bg-base-200 rounded-3xl p-8 text-center gvb-card-hover border border-base-300"
                            >
                                <div className="text-5xl mb-4">{item.icon}</div>
                                <h3 className="font-bold text-base-content text-xl mb-3">{item.title}</h3>
                                <p className="text-base-content/60 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Reviews ── */}
            {approvedReviews.length > 0 && (
                <section className="py-24 px-4 bg-base-200">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-14">
                            <h2 className="font-display text-4xl font-bold text-base-content">
                                Happy <span className="text-primary italic">Clients</span>
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {approvedReviews.map((review) => (
                                <ReviewCard key={review.ReviewId} review={review} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA Banner ── */}
            <section className="py-20 px-4 gvb-gradient">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="font-display text-4xl font-bold text-white mb-4">
                        Ready for Beautiful Nails?
                    </h2>
                    <p className="text-white/80 mb-8 text-lg">
                        Book your appointment today and experience the Good Vibes difference!
                    </p>
                    <Link to="/register" className="btn btn-secondary btn-lg rounded-2xl font-bold px-12 shadow-2xl hover:scale-105 transition-transform">
                        Get Started Today
                    </Link>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="footer footer-center bg-base-300 text-base-content py-10 px-4">
                <div>
                    <div className="text-3xl mb-2">💅</div>
                    <p className="font-display font-bold text-lg text-primary">Good Vibes Beauty</p>
                    <p className="text-base-content/60 text-sm">Where Beauty Meets Excellence</p>
                    <p className="text-base-content/40 text-xs mt-2">📍 Embu Gakwegori (G-town)</p>
                    <p className="text-base-content/40 text-xs">📞 0746177875 / 0705133404</p>
                    <p className="text-base-content/30 text-xs mt-4">
                        © {new Date().getFullYear()} Good Vibes Beauty. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { servicesApi } from '../services/services.api';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ServicesPage = () => {
    const [search, setSearch] = useState('');

    const { data: services, isLoading } = useQuery({
        queryKey: ['services'],
        queryFn: servicesApi.getAll,
    });

    const filtered = services
        ?.filter((s) => s.IsActive && !s.IsDeleted)
        .filter((s) =>
            s.Name.toLowerCase().includes(search.toLowerCase()) ||
            (s.Description ?? '').toLowerCase().includes(search.toLowerCase())
        ) ?? [];

    return (
        <div className="min-h-screen bg-base-200 pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto animate-fade-in">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="badge badge-primary badge-outline mb-4 px-4 py-2 rounded-full uppercase tracking-wider text-xs">
                        Our Menu
                    </div>
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-base-content">
                        Nail <span className="text-primary italic">Services</span>
                    </h1>
                    <p className="text-base-content/60 mt-3 max-w-xl mx-auto">
                        From classic manicures to 3D art designs — we do it all with precision and love.
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-md mx-auto mb-10">
                    <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search services..."
                            className="input input-bordered w-full pl-12 rounded-2xl"
                            id="services-search"
                        />
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <LoadingSpinner />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-6xl mb-4">💅</p>
                        <p className="text-base-content/50 text-lg">
                            {search ? 'No services match your search.' : 'No services available yet.'}
                        </p>
                        {search && (
                            <button onClick={() => setSearch('')} className="btn btn-outline btn-sm rounded-xl mt-4">
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-base-content/40 text-sm mb-6 text-center">
                            {filtered.length} service{filtered.length !== 1 ? 's' : ''} available
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map((service) => (
                                <ServiceCard key={service.ServiceId} service={service} />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ServicesPage;

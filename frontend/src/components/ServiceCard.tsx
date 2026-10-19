import type { Service } from '../types';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
    service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
    const defaultImage =
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=250&fit=crop';

    return (
        <div className="card bg-base-100 shadow-lg gvb-card-hover rounded-2xl overflow-hidden border border-base-200">
            <figure className="relative h-48 overflow-hidden">
                <img
                    src={service.ImageUrl || defaultImage}
                    alt={service.Name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                    <span className="badge badge-primary font-semibold text-xs px-3 py-2">
                        KES {service.Price.toLocaleString()}
                    </span>
                </div>
            </figure>
            <div className="card-body p-5">
                <h3 className="card-title text-lg font-bold text-base-content">
                    {service.Name}
                </h3>
                {service.Description && (
                    <p className="text-base-content/60 text-sm line-clamp-2">
                        {service.Description}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-1 text-sm text-base-content/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{service.DurationMinutes} mins</span>
                    {service.DepositAmount && (
                        <>
                            <span className="text-base-content/30">•</span>
                            <span>Deposit: KES {service.DepositAmount.toLocaleString()}</span>
                        </>
                    )}
                </div>
                <div className="card-actions mt-3">
                    <Link
                        to={`/book?serviceId=${service.ServiceId}`}
                        className="btn btn-primary btn-sm w-full rounded-xl font-semibold"
                    >
                        Book Now 💅
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;

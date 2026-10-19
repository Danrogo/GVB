import type { Review } from '../types';

interface ReviewCardProps {
    review: Review;
    customerName?: string;
}

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <svg
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-base-300 fill-base-300'}`}
                viewBox="0 0 24 24"
            >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ))}
    </div>
);

const ReviewCard = ({ review, customerName }: ReviewCardProps) => {
    const initials = customerName
        ? customerName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'C';

    return (
        <div className="card bg-base-100 shadow-md border border-base-200 rounded-2xl gvb-card-hover">
            <div className="card-body p-5">
                <div className="flex items-start gap-3">
                    <div className="avatar placeholder flex-shrink-0">
                        <div className="bg-primary text-primary-content rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                            {initials}
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-base-content text-sm">
                                {customerName || 'Customer'}
                            </p>
                            <span className="text-xs text-base-content/40">
                                {new Date(review.CreatedAt).toLocaleDateString('en-KE', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        <StarRating rating={review.Rating} />
                    </div>
                </div>
                {review.Comment && (
                    <p className="text-base-content/70 text-sm mt-3 leading-relaxed italic">
                        "{review.Comment}"
                    </p>
                )}
            </div>
        </div>
    );
};

export default ReviewCard;

const LoadingSpinner = ({ fullPage = false }: { fullPage?: boolean }) => {
    if (fullPage) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 gap-4">
                <span className="loading loading-spinner loading-lg text-primary" />
                <p className="text-base-content/60 font-medium animate-pulse">
                    Good Vibes Beauty...
                </p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-12">
            <span className="loading loading-spinner loading-md text-primary" />
        </div>
    );
};

export default LoadingSpinner;

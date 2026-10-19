import React, { Component, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-base-200">
                    <div className="card bg-base-100 shadow-xl max-w-md w-full mx-4">
                        <div className="card-body items-center text-center">
                            <div className="text-6xl mb-4">💅</div>
                            <h2 className="card-title text-error text-2xl">Oops! Something went wrong</h2>
                            <p className="text-base-content/70 mt-2">
                                {this.state.error?.message || 'An unexpected error occurred.'}
                            </p>
                            <div className="card-actions mt-4">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => window.location.reload()}
                                >
                                    Reload Page
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

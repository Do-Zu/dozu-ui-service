import React from 'react';
import ErrorPage from './ErrorPage';
import LoadingPage from '@/app/loading';

interface Props<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    children: (data: T) => React.ReactNode;
    onNull?: string | React.ReactNode;
    onEmpty?: string | React.ReactNode;
}

export default function FetchBoundary<T>({ data, loading, error, children, onNull, onEmpty }: Props<T>) {
    if (error) {
        return <ErrorPage message={error} />;
    }
    if (loading) {
        return <LoadingPage />;
    }

    if (data === null) {
        if (onNull) {
            return typeof onNull === 'string' ? <div className="p-8">{onNull}</div> : <>{onNull}</>;
        }
        return <div className="p-8">Something went wrong. Please try again.</div>;
    }

    if (onEmpty && Array.isArray(data) && data.length === 0) {
        if (typeof onEmpty === 'string') return <div className="p-8">{onEmpty}</div>;
        return onEmpty;
    }

    return <>{children(data)}</>;
}

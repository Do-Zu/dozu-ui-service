import ErrorBoundary from '@/core/error/ErrorBoundary';
import { IProcessingFetching } from '@/hooks/type';
import useFetch from '@/hooks/useFetch';
import Spinner from './spinner';

type WithDataFetchingProps<T> = {
  param: string | (() => Promise<T>);
};

type WrappedComponentProps<T> = Omit<
  IProcessingFetching<T>,
  'loading' | 'error'
>;

function withDataFetching<T>(
  WrapperComponent: React.ComponentType<WrappedComponentProps<T>>,
) {
  return function WithDataFetchingComponent<T>({
    param,
  }: WithDataFetchingProps<T> & Omit<WrappedComponentProps<T>, 'data'>) {
    const { data, error, loading } = useFetch(param);

    if (loading) {
      return <Spinner />;
    }

    if (error) {
      return <ErrorBoundary />;
    }

    return <WrapperComponent data={Array.isArray(data) ? data : []} />;
  };
}

export default withDataFetching;

'use client';

import { ReactElement } from 'react';
import DefaultLayout from '../components/layouts/DefaultLayout';
// import { AppProps } from 'next/app';
// import CustomLayout from '../components/layouts/CustomLayout';
import HomePage from './home';
import { store } from '../store/store';
import { Provider } from 'react-redux';
import ErrorBoundary from '../components/core/error/ErrorBoundary';

// type NextPageWithLayout = {
//   layoutType?: string;
//   getLayout?: (page: ReactElement) => ReactNode;
// } & React.FC;

// type AppPropsWithLayout = AppProps & {
//   Component: NextPageWithLayout;
// };

function App() {
  // const layoutType = Component.layoutType || 'default';

  const getLayout = (page: ReactElement) => {
    return <DefaultLayout>{page}</DefaultLayout>;
  };

  return (
    <Provider store={store}>
      <ErrorBoundary>{getLayout(<HomePage />)}</ErrorBoundary>
    </Provider>
  );
}

export default App;

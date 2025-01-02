import { ReactElement } from 'react';
import DefaultLayout from '../components/layouts/DefaultLayout';
// import { AppProps } from 'next/app';
// import CustomLayout from '../components/layouts/CustomLayout';
import HomePage from './home';

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

  return <>{getLayout(<HomePage />)}</>;
}

export default App;

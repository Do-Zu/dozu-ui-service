import DataTableDemo from '@/components/demo/dataTableDemo';
import { Button } from '@/components/ui/button';
import { NextPage } from 'next';
import ThemeToggle from '@/components/theme/ThemeToggle';

const HomePage: NextPage = () => {
  return (
    <>
    <ThemeToggle/>
      <div>
        Testing Pipeline Staging feature/merge with Github Action pipeline
        optimized pipeline v1
      </div>
      <Button>shacdn</Button>
      <DataTableDemo />
    </>
  );
};

export default HomePage;

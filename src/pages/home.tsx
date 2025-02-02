import DataTableDemo from '@/components/demo/dataTableDemo';
import { Button } from '@/components/ui/button';
import { NextPage } from 'next';

const HomePage: NextPage = () => {
  return (
    <>
      <div>Testing Pipeline Staging feature/merge with jenkins</div>
      <Button>shacdn</Button>
      <DataTableDemo />
    </>
  );
};

export default HomePage;

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Check } from 'lucide-react';

const OnboardingCompleteCard: React.FC = ({}) => {
  return (
    <Card className="rounded-2xl shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-center mb-6">
          <div className=" p-4 rounded-full">
            <Check className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-xl font-semibold text-center  mb-2">Onboarding survey completed</h1>

        <div className="flex justify-center ">
          <Link href="/">
            <Button>Home</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingCompleteCard;

'use client';
import SetupForm from "@/app/[locale]/setting/schedule-setup/components/SetupForm";

const ScheduleSetupPage = () => {
  return (
    <div className="p-6 bg-white rounded-md shadow-sm">
      <h1 className="text-xl font-semibold">Schedule Setup</h1>
      <SetupForm onComplete={() => alert('Setup thành công')} />
    </div>
  );
};

export default ScheduleSetupPage;

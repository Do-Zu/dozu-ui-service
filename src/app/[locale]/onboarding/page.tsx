'use client';

import React, { useState } from 'react';
import WelcomeStepCard from './components/WelcomeStepCard';
import TopicTagStepCard from './components/TopicTagStepCard';
import StudyDurationStepCard from './components/StudyDurationStepCard';
import StudyMethodStepCard from './components/StudyMethodStepCard';
import OnboardingCompleteCard from './components/OnboardingCompleteCard';
import usePost from '@/hooks/usePost';
import LoadingPage from '@/app/loading';
import AuthSkeleton from '@/components/ui/auth-skeleton';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';

const OnBoardingPage: React.FC = () => {
  const { handleOnboardingComplete } = useAuthNavigation();

  const [currentStep, setCurrentStep] = useState(0);
  const [interestedTopicTags, setInterestedTopicTags] = useState<string[]>([]);
  const [studyDuration, setStudyDuration] = useState(15);
  const [studyMethods, setStudyMethods] = useState<string[]>([]);

  //navigating cards
  const proceed = () => {
    setCurrentStep(currentStep + 1);
  };
  const goBack = () => {
    setCurrentStep(currentStep - 1);
  };

  //topic tags
  const addTopicTag = (topicTag: string) => {
    setInterestedTopicTags(interestedTopicTags.concat(topicTag));
  };

  const removeTopicTag = (topicTag: string) => {
    setInterestedTopicTags(interestedTopicTags.filter((a) => a !== topicTag));
  };

  //study methods
  const addStudyMethod = (studyMethod: string) => {
    setStudyMethods(studyMethods.concat(studyMethod));
  };

  const removeStudyMethod = (studyMethod: string) => {
    setStudyMethods(studyMethods.filter((a) => a !== studyMethod));
  };

  const body = {
    interestedTopicTags: interestedTopicTags,
    studyDuration: studyDuration,
    studyMethods: studyMethods,
  };

  const {
    loading,
    data: apiResponse,
    error: apiPostContentError,
    execute,
  } = usePost<any, any>('/onboarding/onboarding-result', 'POST');
  const finishSurvey = async () => {
    await execute(body);
    handleOnboardingComplete();
  };

  const steps: JSX.Element[] = [
    <WelcomeStepCard proceed={proceed} />,
    <TopicTagStepCard
      interestedTopicTags={interestedTopicTags}
      proceed={proceed}
      goBack={goBack}
      addTopicTag={addTopicTag}
      removeTopicTag={removeTopicTag}
    />,
    <StudyDurationStepCard
      studyDuration={studyDuration}
      proceed={proceed}
      goBack={goBack}
      setStudyDuration={setStudyDuration}
    />,
    <StudyMethodStepCard
      studyMethods={studyMethods}
      proceed={finishSurvey}
      goBack={goBack}
      addStudyMethod={addStudyMethod}
      removeStudyMethod={removeStudyMethod}
    />,

    <OnboardingCompleteCard />,
  ];

  if (loading) {
    return <LoadingPage />;
  }

  if (!loading && (apiResponse || apiPostContentError)) {
    return <AuthSkeleton />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">{steps[currentStep]}</div>
    </div>
  );
};

export default OnBoardingPage;

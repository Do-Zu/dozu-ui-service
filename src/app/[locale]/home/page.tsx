'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';

import { BookOpen, FileQuestion, Gamepad2, MessageSquare, PlusCircle } from 'lucide-react';
import ContentLibrary from './components/ContentLibrary';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-[#dee2e6] dark:border-gray-700 p-2">
        {/* <div className="flex gap-4">
          <Button className={'bg-[#343a40] text-white'}>{'Dashboard'}</Button>
          <Button className={'text-[#495057] border-[#ced4da]'}>library.title</Button>
          <Button variant="outline" className="text-[#495057] border-[#ced4da]">
            flashcards.studyProgress
          </Button>
          <Button variant="outline" className="text-[#495057] border-[#ced4da]">
            next
          </Button>
        </div> */}
      </div>
      <ContentLibrary />

      {/* <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onComplete={handleImportComplete}
      /> */}
    </div>
  );
};

export default Home;

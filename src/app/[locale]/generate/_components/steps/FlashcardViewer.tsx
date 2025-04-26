'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, X } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

interface FlashcardItem {
  q: string;
  a: string;
}

interface FlashcardViewerProps {
  flashcards: FlashcardItem[];
  onClose?: () => void;
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcards = [], onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [filteredCards, setFilteredCards] = useState<FlashcardItem[]>(flashcards);
  const [searchQuery, setSearchQuery] = useState('');

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === filteredCards.length - 1 ? 0 : prev + 1));
    }, 200);
  };

  const handlePrevious = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? filteredCards.length - 1 : prev - 1));
    }, 200);
  };

  const handleFlip = () => {
    setFlipped((prev) => !prev);
  };

  const handleShuffle = () => {
    setFlipped(false);
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    setFilteredCards(shuffled);
    setCurrentIndex(0);
  };

  const handleReset = () => {
    setFlipped(false);
    setFilteredCards(flashcards);
    setCurrentIndex(0);
    setSearchQuery('');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredCards(flashcards);
      return;
    }

    const filtered = flashcards.filter(
      (card) => card.q.toLowerCase().includes(query) || card.a.toLowerCase().includes(query),
    );

    setFilteredCards(filtered);
    setCurrentIndex(0);
  };

  const currentCard = filteredCards[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between mb-4 items-center">
        <div className="text-xl font-bold">Flashcards</div>
        <div className="flex space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search flashcards..."
              value={searchQuery}
              onChange={handleSearch}
              className="px-3 py-1 border rounded-md pr-8 w-[250px]"
            />
            {searchQuery && (
              <X
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
                onClick={() => {
                  setSearchQuery('');
                  setFilteredCards(flashcards);
                }}
              />
            )}
          </div>
          <div className="flex border rounded-md overflow-hidden">
            <button
              className={`px-3 py-1 ${viewMode === 'card' ? 'bg-primary text-white' : 'bg-white'}`}
              onClick={() => setViewMode('card')}
            >
              Card
            </button>
            <button
              className={`px-3 py-1 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Card View */}
      {viewMode === 'card' && filteredCards.length > 0 && (
        <div className="flex flex-col">
          <div className="text-center mb-4">
            <span className="text-sm text-gray-500">
              Card {currentIndex + 1} of {filteredCards.length}
            </span>
          </div>

          <div className="w-full h-64 mb-6 perspective-1000">
            <div className="w-full h-full cursor-pointer" onClick={handleFlip}>
              <div
                className={`w-full h-full rounded-xl p-6 shadow-lg flex items-center justify-center 
                            ${flipped ? 'bg-blue-50' : 'bg-white'} border-2 border-blue-200`}
              >
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-2">
                    {flipped ? 'Answer' : 'Question'}
                  </div>
                  <div className="text-lg font-medium">
                    {flipped ? currentCard.a : currentCard.q}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            <Button variant="outline" size="sm" onClick={handlePrevious}>
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button variant="outline" size="sm" onClick={handleFlip}>
              {flipped ? 'Show Question' : 'Show Answer'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleNext}>
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="flex justify-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleShuffle}>
              <Shuffle className="mr-1 h-4 w-4" /> Shuffle
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredCards.length > 0 ? (
            filteredCards.map((card, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 bg-gray-50 border-b">
                    <div className="text-sm text-gray-500 mb-1">Question {index + 1}</div>
                    <div className="font-medium">{card.q}</div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-500 mb-1">Answer</div>
                    <div>{card.a}</div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">No flashcards match your search.</div>
          )}
        </div>
      )}

      {filteredCards.length === 0 && viewMode === 'card' && (
        <div className="text-center py-10 text-gray-500">No flashcards match your search.</div>
      )}
    </div>
  );
};

export default FlashcardViewer;

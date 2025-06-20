'use client';

import { postRequest } from '@/api/api';
import { Textarea } from '@/components/ui/textarea';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Edit, Import, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IFlashcardAdded, IFlashcardBasic, IFlashcardDeleted, IFlashcardUpdated } from '../flashcard.type'; 
import useFetch from '@/hooks/useFetch';
import BackButton from '../components/BackButton';

interface IFlashcard {
  id: number;
  front: string;
  back: string;
}

interface IFlashcardServer {
  flashcardId: number;
  topicId: number;
  isUpdated: boolean;
  isDeleted: boolean;
}

interface IFlashcardWithServer extends IFlashcard {
  serverInfo?: IFlashcardServer;
}

interface IFlashcardsWithTopicName {
  flashcards: IFlashcardBasic[];
  topicName: string;
}

interface FlashcardsSubmitted {
  flashcardsAdded?: IFlashcardAdded[];
  flashcardsUpdated?: IFlashcardUpdated[];
  flashcardsDeleted?: IFlashcardDeleted[];
}

const initialFlashcardsCount = 3;
const flashcardsJump = 3;

function isEmptyArray(array: any[]): boolean {
  return array.length === 0;
}

function createInitialFlashcard(id: number): IFlashcard {
  return { id, front: '', back: '' };
}

function createInitialFlashcards(count: number): IFlashcard[] {
  const initialFlashcards: IFlashcard[] = [];
  for (let i = 0; i < count; ++i) {
    initialFlashcards.push(createInitialFlashcard(i));
  }
  return initialFlashcards;
}

function getFlashcardType(flashcard: IFlashcardWithServer): 'client' | 'server' {
  return flashcard.serverInfo ? 'server' : 'client';
}

const Page = () => {
  let router = useRouter();

  const searchParamsClient = useSearchParams();
  if (!searchParamsClient) {
    return <div>Loading or invalid context...</div>;
  }

  const topicId = searchParamsClient.get('topicId')!;

  const {
    data: flashcardsExisted,
    // setData: setFlashcardsExisted,
    loading: flashcardsLoading,
    error: flashcardsError,
  } = useFetch<IFlashcardsWithTopicName>(`/flashcards?topicId=${topicId}`); // done check type

  const [flashcardsCount, setFlashcardsCount] = useState<number>(initialFlashcardsCount);
  const [flashcards, setFlashcards] = useState<IFlashcardWithServer[] | null>();

  useEffect(() => {
    if (!flashcardsExisted) return;

    let initialFlashcards: IFlashcardWithServer[];
    if (isEmptyArray(flashcardsExisted.flashcards)) {
      initialFlashcards = createInitialFlashcards(initialFlashcardsCount);
    } else {
      initialFlashcards = flashcardsExisted.flashcards.map((flashcard, index) => {
        return {
          id: index,
          front: flashcard.front,
          back: flashcard.back,
          serverInfo: {
            flashcardId: flashcard.flashcardId,
            topicId: flashcard.topicId,
            isUpdated: false,
            isDeleted: false,
          },
        };
      });
      for (let i = initialFlashcards.length; i % 3 !== 0; ++i) {
        initialFlashcards.push(createInitialFlashcard(i));
      }
    }
    setFlashcards(initialFlashcards);
  }, [flashcardsExisted]);

  // fix, useEffect is not necessary
  useEffect(() => {
    if (!flashcards) return;
    if (flashcardsCount === flashcardsJump) return;
    let newFlashcards = [...flashcards];
    let lastId = newFlashcards[newFlashcards.length - 1].id;
    let startId = lastId + 1;
    for (let i = flashcardsCount - flashcardsJump; i < flashcardsCount; ++i) {
      newFlashcards.push({ id: startId, front: '', back: '' });
      ++startId;
    }
    setFlashcards(newFlashcards);
  }, [flashcardsCount]);

  function handleOnChangeFlashcard(
    side: 'front' | 'back',
    type: 'client' | 'server',
    flashcard: { order: number; text: string },
  ) {
    if (!flashcards) return;
    let newFlashcards: IFlashcardWithServer[] = flashcards;
    let { order, text } = flashcard;

    if (type === 'client') {
      if (side === 'front') {
        newFlashcards = flashcards.map((flashcard, index) => {
          return index === order ? { ...flashcard, front: text } : flashcard;
        });
      } else if (side === 'back') {
        newFlashcards = flashcards.map((flashcard, index) => {
          return index === order ? { ...flashcard, back: text } : flashcard;
        });
      }
    } else if (type === 'server') {
      if (side === 'front') {
        newFlashcards = flashcards.map((flashcard, index) => {
          return flashcard.serverInfo && index === order
            ? {
                ...flashcard,
                front: text,
                serverInfo: { ...flashcard.serverInfo, isUpdated: true, isDeleted: false },
              }
            : flashcard;
        });
      } else {
        newFlashcards = flashcards.map((flashcard, index) => {
          return flashcard.serverInfo && index === order
            ? {
                ...flashcard,
                back: text,
                serverInfo: { ...flashcard.serverInfo, isUpdated: true, isDeleted: false },
              }
            : flashcard;
        });
      }
    }

    setFlashcards(newFlashcards);
  }

  function handleAddFlashcardsCount() {
    setFlashcardsCount((prevCount) => prevCount + flashcardsJump);
  }

  function handleDeleteFlashcard(type: 'client' | 'server', flashcardId: number) {
    if (!flashcards) return;
    let newFlashcards: IFlashcardWithServer[] = flashcards;

    if (type === 'client') {
      newFlashcards = flashcards.filter((flashcard) => flashcard.id !== flashcardId);

      newFlashcards.push({
        id: newFlashcards[newFlashcards.length - 1].id + 1,
        front: '',
        back: '',
      });
    } else if (type === 'server') {
      newFlashcards = flashcards.map((flashcard) => {
        return flashcard.serverInfo && flashcard.id === flashcardId
          ? {
              ...flashcard,
              serverInfo: { ...flashcard.serverInfo, isUpdated: false, isDeleted: true },
            }
          : flashcard;
      });
      let startId = newFlashcards[newFlashcards.length - 1].id + 1;
      newFlashcards.push(createInitialFlashcard(startId));
    }
    setFlashcards(newFlashcards);
  }

  async function handleSave() {
    if (!flashcards) return;

    let flashcardsFormatted = flashcards.map((flashcard) => {
      return {
        ...flashcard,
        front: flashcard.front.trim(),
        back: flashcard.back.trim(),
      };
    });

    let flashcardsAdded: IFlashcardAdded[];
    let flashcardsUpdated: IFlashcardUpdated[];
    let flashcardsDeleted: IFlashcardDeleted[];

    let flashcardsFilter;

    flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
      return !flashcard.serverInfo && (flashcard.front !== '' || flashcard.back !== '');
    });
    flashcardsAdded = flashcardsFilter.map((flashcard) => ({
      front: flashcard.front,
      back: flashcard.back,
    }));

    flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
      return (
        flashcard.serverInfo &&
        flashcard.serverInfo.isUpdated &&
        flashcard.front !== '' &&
        flashcard.back !== ''
      );
    });
    flashcardsUpdated = flashcardsFilter.map((flashcard) => ({
      flashcardId: flashcard.serverInfo!.flashcardId,
      front: flashcard.front,
      back: flashcard.back,
    }));

    flashcardsFilter = flashcardsFormatted.filter((flashcard) => {
      return (
        flashcard.serverInfo &&
        (flashcard.serverInfo.isDeleted ||
          (flashcard.serverInfo.isUpdated && flashcard.front === '' && flashcard.back === ''))
      );
    });
    flashcardsDeleted = flashcardsFilter.map((flashcard) => flashcard.serverInfo!.flashcardId);

    if (
      (!flashcardsAdded || flashcardsAdded.length === 0) &&
      (!flashcardsUpdated || flashcardsUpdated.length === 0) &&
      (!flashcardsDeleted || flashcardsDeleted.length === 0)
    )
      return;

    let dataSubmit: FlashcardsSubmitted = { flashcardsAdded, flashcardsUpdated, flashcardsDeleted };

    try {
      await postRequest(`/flashcards/batch?topicId=${topicId}`, dataSubmit);
      router.push('/home');
    } catch (err) {
      console.log(err);
    }
  }

  if (flashcardsLoading) {
    return <div>Loading...</div>;
  }

  if (flashcardsError) {
    return <div>Error: {flashcardsError} </div>;
  }

  // console.log(flashcards);
  return (
    <div className="px-[4rem] py-7 bg-[#F9FAFB]">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-4 items-center">
          <BackButton />
          <div className="text-[#1F2937] text-[1.7rem] font-bold">
            {flashcardsExisted?.topicName}
          </div>
        </div>
        <div className="flex flex-row gap-4">
          <Button className="flex flex-row items-center">
            <Import size={24} />
            <div className="text-base">Import</div>
          </Button>

          <Button onClick={handleSave} className="flex flex-row items-center">
            <Save size={24} />
            <div className="text-base">Save</div>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-col mt-7">
        {flashcards?.map((flashcard, index) => {
          if (flashcard.serverInfo?.isDeleted) return null;
          return (
            <div
              key={flashcard.id}
              className="col-span-4 bg-white p-8 text-center flex flex-col gap-4 rounded-xl"
            >
              <div className="flex flex-rol gap-4 justify-end">
                <Edit size={20} className="cursor-pointer" />
                <Trash2
                  size={20}
                  className="cursor-pointer"
                  onClick={() => handleDeleteFlashcard(getFlashcardType(flashcard), flashcard.id)}
                />
              </div>
              <div className="flex flex-col gap-4">
                <Textarea
                  placeholder="Front"
                  className="resize-none"
                  value={flashcard.front}
                  onChange={(event) =>
                    handleOnChangeFlashcard('front', getFlashcardType(flashcard), {
                      order: index,
                      text: event.target.value,
                    })
                  }
                />
                <Textarea
                  placeholder="Back"
                  className="resize-none"
                  value={flashcard.back}
                  onChange={(event) =>
                    handleOnChangeFlashcard('back', getFlashcardType(flashcard), {
                      order: index,
                      text: event.target.value,
                    })
                  }
                />
              </div>
            </div>
          );
        })}

        <div className="col-span-12 flex justify-center">
          <Button onClick={handleAddFlashcardsCount}>+ Add Cards</Button>
        </div>
      </div>
    </div>
  );
};

export default Page;

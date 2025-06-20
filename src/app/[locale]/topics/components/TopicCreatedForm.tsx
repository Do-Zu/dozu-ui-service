import { postRequest } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent } from 'react';
import { ITopicForUser, ITopicsForUserReturned } from '../topic.type';
import TopicsList from './TopicsList';

interface Props {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  handleCloseModal?: () => void;
  setTopics: ((topic: ITopicForUser) => void)
}

export const TopicCreatedForm = ({
  name,
  setName,
  description,
  setDescription,
  handleCloseModal,
  setTopics
}: Props) => {
  function handleOnChangeName(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  function handleOnChangeDescription(event: ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
  }

  async function handleOnClickCreate() {
    if (!name) {
      alert("Name can't be blank");
      return;
    }

    const dataSubmitted = { topicName: name, topicDescription: description };
    try {
      let data = await postRequest<any, { data: ITopicForUser }>('/topics', dataSubmitted);
      data.data['flashcardsCount'] = 0;
      setTopics(data.data);
      handleCloseModal?.();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="text-primary text-base font-normal">Name</div>
        <Input value={name} onChange={handleOnChangeName} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-primary text-base font-normal">Description</div>
        <Input value={description ? description : ''} onChange={handleOnChangeDescription} />
      </div>

      <div>
        <Button className="text-base" onClick={handleOnClickCreate}>
          Create
        </Button>
      </div>
    </div>
  );
};

import { putRequest } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent } from 'react';
import { ITopicForUser } from '../topic.type';

interface Props {
  name: string;
  setName: (name: string) => void;
  description: string | undefined | null; // todo: set this to only string (or not)
  setDescription: (description: string | undefined | null) => void; // todo: set this to only string (or not)
  handleCloseModal?: () => void;
  topicId: number // todo: set all of topicId to number (have to cast string to number)
  setTopics: ((topic: ITopicForUser) => void)
}

export const TopicUpdatedForm = ({ name, setName, description, setDescription, handleCloseModal, topicId, setTopics }: Props) => {
  function handleOnChangeName(event: ChangeEvent<HTMLInputElement>) {
    setName(event.target.value);
  }

  function handleOnChangeDescription(event: ChangeEvent<HTMLInputElement>) {
    setDescription(event.target.value);
  }

  async function handleOnClickSave() {
    if(!name) {
      alert("Name can't be blank");
      return;
    }
    try {
      const topicName = name,
        topicDescription = description ? description : '';
      const dataSubmitted = { topicName, topicDescription };
      const data = await putRequest<any, { data: ITopicForUser }>(`/topics/${topicId}`, dataSubmitted);
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
        <Button className="text-base" onClick={handleOnClickSave}>Save</Button>
      </div>
    </div>
  );
};

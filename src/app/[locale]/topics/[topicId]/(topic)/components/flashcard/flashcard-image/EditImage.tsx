import { IUnspashImage } from '@/app/[locale]/flashcards/types/flashcard.type';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

function SelectImage({
    images,
    onSaveClick,
}: {
    images: IUnspashImage[];
    onSaveClick: (image: IUnspashImage) => void;
}) {
    if (images.length === 0) {
        return <div>No images found, please try again.</div>;
    }
    return (
        <div className="w-full h-full grid grid-cols-4 gap-4">
            {images.map((image) => {
                return (
                    <Button
                        variant="ghost"
                        key={image.id}
                        className="col-span-1 relative w-full h-48 hover:scale-110 hover:bg-transparent"
                        onClick={() => onSaveClick(image)}
                    >
                        <Image
                            src={image.url.thumb}
                            alt={image.description ?? 'Flashcard image'}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain"
                        />
                    </Button>
                );
            })}
        </div>
    );
}

interface Props {
    images: IUnspashImage[] | null;
    handleSaveClick: (image: IUnspashImage) => void;
}

export default function EditImage({ images, handleSaveClick }: Props) {
    return (
        <div className="w-full h-full">
            <div className="flex flex-col gap-3">
                <h3 className="text-xl font-semibold tracking-wide">Searching images</h3>
                <SelectImage images={images ?? []} onSaveClick={handleSaveClick} />
            </div>
        </div>
    );
}

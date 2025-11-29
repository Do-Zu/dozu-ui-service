import LoadingPage from '@/app/loading';
import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export interface IUnspashImage {
    id: string;
    description: string | null;
    url: {
        thumb: string;
        small: string;
    };
    // user: Basic;
    links: {
        self: string;
        html: string;
        download: string;
        download_location: string;
    };
    width?: number;
    height?: number;
}

function ImagesPreview({
    images,
    handleSaveClick,
}: {
    images: IUnspashImage[];
    handleSaveClick: (image: IUnspashImage) => void;
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
                        onClick={() => handleSaveClick(image)}
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
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    currentThumb?: string | null;
    currentImageUrl?: string | null;
    images: IUnspashImage[] | null;
    loading: boolean;
    handleSaveClick: (image: IUnspashImage) => void;
}

export default function ImagesPreviewModal({
    isOpen,
    setIsOpen,
    currentThumb,
    currentImageUrl,
    images,
    loading,
    handleSaveClick,
}: Props) {
    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Choose an image for your card"
            body={
                <div className="w-full h-full flex flex-col gap-10">
                    {currentThumb && (
                        <div className="w-full h-48 relative flex flex-col gap-3">
                            <h3 className="text-xl font-semibold tracking-wide">Recently selected image</h3>
                            <div className="flex-1 relative">
                                <Image
                                    src={currentThumb}
                                    alt="Flashcard image"
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-contain object-left"
                                />
                            </div>
                        </div>
                    )}

                    {currentImageUrl ? (
                        <div className="w-1/2 relative flex flex-col gap-3">
                            <h3 className="text-xl font-semibold tracking-wide">Current image</h3>
                            <div className="flex-1 relative">
                                <Image
                                    src={currentImageUrl}
                                    alt="Current image"
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="w-full h-full object-contain rounded-xl shadow"
                                />
                            </div>
                        </div>
                    ) : <div className='px-6 text-muted-foreground'>No image selected</div>}

                    {loading && !images ? (
                        <LoadingPage />
                    ) : (
                        <div className="flex flex-col gap-3">
                            <h3 className="text-xl font-semibold tracking-wide">Searching images</h3>
                            <ImagesPreview images={images ?? []} handleSaveClick={handleSaveClick} />
                        </div>
                    )}
                </div>
            }
            contentStyle="top-[10%] left-[50%] max-w-[80vw] h-[80vh] -translate-x-1/2 -translate-y-0"
        />
    );
}

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { ReactElement } from "react";

interface Props {
  trigger: ReactElement
  title: string
  description: ReactElement | string
  body: ReactElement
}

export const DeleteAlertingModal = ({ trigger, title, description, body } : Props) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/60 fixed inset-0"/>
        <Dialog.Content className="bg-[#fcfcfc] rounded-[6px] shadow-[0_10px_38px_-10px_rgba(22,23,24,0.35),0_10px_20px_-15px_rgba(22,23,24,0.2)] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[500px] max-h-[85vh] p-[25px] z-[1001] overflow-y-auto focus:outline-none">
          <Dialog.Title className="mb-[10px] font-medium text-red-400 text-[17px]">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mb-5 text-[15px] leading-[1.5]">
            {description}
          </Dialog.Description>
          {body}
          <Dialog.Close asChild>
            <Button variant='ghost' className='rounded-full h-[35px] w-[35px] inline-flex items-center justify-center absolute top-[20px] right-[20px]' aria-label="Close">
              <X/>
            </Button>
				</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
};

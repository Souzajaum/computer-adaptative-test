import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export const Modal = ({ open, onOpenChange, title, children }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-gray-800 p-6 shadow-lg focus:outline-none">
          {title && (
            <Dialog.Title className="text-lg font-bold mb-4">
              {title}
            </Dialog.Title>
          )}
          {children}
          <Dialog.Close asChild>
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

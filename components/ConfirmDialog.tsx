import { Fragment, FunctionComponent, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

type Content = {
  title?: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive: boolean;
};

type Props = {
  open: boolean;
  content: Content | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog: FunctionComponent<Props> = ({ open, content, onConfirm, onCancel }) => {
  // Keep rendering the last content while the panel plays its leave
  // transition, instead of popping empty the instant it closes.
  const [displayContent, setDisplayContent] = useState<Content | null>(null);
  useEffect(() => {
    if (content) setDisplayContent(content);
  }, [content]);

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onCancel} className="relative z-[1300]">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-200 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition duration-200 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition duration-150 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
              {displayContent && (
                <>
                  {displayContent.title && (
                    <Dialog.Title className="text-base font-semibold text-gray-900">
                      {displayContent.title}
                    </Dialog.Title>
                  )}
                  <p className="text-sm text-gray-600 mt-1.5">{displayContent.message}</p>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={onCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
                    >
                      {displayContent.cancelLabel}
                    </button>
                    <button
                      onClick={onConfirm}
                      className={`px-4 py-2 text-sm font-semibold text-white rounded-md ${
                        displayContent.destructive
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "bg-slate-800 hover:bg-slate-900"
                      }`}
                    >
                      {displayContent.confirmLabel}
                    </button>
                  </div>
                </>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmDialog;

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// Size -> [chest, waist, hips] in inches
const SIZES = [
  ['XS', '32-34', '24-26', '34-36'],
  ['S', '34-36', '26-28', '36-38'],
  ['M', '36-38', '28-30', '38-40'],
  ['L', '38-40', '30-32', '40-42'],
  ['XL', '40-42', '32-34', '42-44'],
  ['XXL', '42-44', '34-36', '44-46'],
];

const SizeGuideModal = ({ open, onClose }) => (
  <Transition appear show={open} as={React.Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={React.Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </Transition.Child>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
              <div className="flex items-center justify-between mb-6">
                <Dialog.Title className="text-2xl font-bold text-gray-900 dark:text-white">Size Guide</Dialog.Title>
                <button
                  onClick={onClose}
                  aria-label="Close size guide"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                      {['Size', 'Chest (in)', 'Waist (in)', 'Hips (in)'].map((h) => (
                        <th key={h} className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZES.map(([size, ...measures]) => (
                      <tr key={size} className="border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{size}</td>
                        {measures.map((m, i) => (
                          <td key={i} className="py-3 px-4 text-gray-600 dark:text-gray-300">{m}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Note:</strong> Measurements are in inches. For the best fit, measure yourself
                  and compare with the size chart above. If you're between sizes, we recommend sizing up.
                </p>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

export default SizeGuideModal;

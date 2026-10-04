import { useCallback, useRef, useState } from 'react';

/**
 * Wraps a form submit handler so it can't run twice at the same time.
 * A ref (not state) blocks the second click: state updates only land on the
 * next render, so a fast double-click would otherwise slip through.
 *
 *   const [handleSubmit, submitting] = useSubmitOnce(async (e) => { ... });
 */
const useSubmitOnce = (submit) => {
  const busy = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const run = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (busy.current) return;
      busy.current = true;
      setSubmitting(true);
      try {
        await submit(e);
      } finally {
        busy.current = false;
        setSubmitting(false);
      }
    },
    [submit]
  );

  return [run, submitting];
};

export default useSubmitOnce;

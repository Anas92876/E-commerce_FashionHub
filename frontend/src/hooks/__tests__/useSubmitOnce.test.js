import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import useSubmitOnce from '../useSubmitOnce';

const Form = ({ save }) => {
  const [handleSubmit, submitting] = useSubmitOnce(save);
  return (
    <form onSubmit={handleSubmit}>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Create'}
      </button>
    </form>
  );
};

test('a double click only submits once', async () => {
  let finish;
  const save = jest.fn(() => new Promise((resolve) => { finish = resolve; }));
  render(<Form save={save} />);

  const form = screen.getByRole('button').closest('form');
  // two submits in the same tick, before React re-renders
  act(() => {
    fireEvent.submit(form);
    fireEvent.submit(form);
  });
  expect(save).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();

  await act(async () => finish());
  expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();

  // a later, separate submit works again
  act(() => {
    fireEvent.submit(form);
  });
  expect(save).toHaveBeenCalledTimes(2);
  await act(async () => finish());
});

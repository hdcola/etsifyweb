import { it, expect, describe, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CountCard from '../../src/components/CountCard';
import '@testing-library/jest-dom/vitest';

describe('CountCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('should increment the count on button click', () => {
    render(<CountCard />);
    const button = screen.getByRole('button', { name: /count is 0/i });
    fireEvent.click(button);
    expect(button).toHaveTextContent('count is 1');
    fireEvent.click(button);
    expect(button).toHaveTextContent('count is 2');
  });

  it('should display the paragraph text', () => {
    render(<CountCard />);
    const paragraph = screen.getByText(
      /hello world\. this is a simple example of a react component\./i
    );
    expect(paragraph).toBeInTheDocument();
  });
});

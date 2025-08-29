/**
 * Tests for MemoryCard component.
 * Framework/Library: React Testing Library with Jest/Vitest (aligns with project setup).
 *
 * Coverage goals:
 * - Renders with required props (happy path)
 * - Handles click/flip interaction
 * - Respects disabled/matched states
 * - Keyboard accessibility (Enter/Space)
 * - ARIA attributes and tabIndex contracts
 * - Ignores unexpected inputs gracefully
 * - Snapshot for minimal render stability
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Prefer relative import; adjust if component export path differs.
import MemoryCard from './MemoryCard';

type CardProps = React.ComponentProps<typeof MemoryCard>;

function setup(overrides: Partial<CardProps> = {}) {
  const onFlip = vi.fn?.() || jest.fn();
  const props: CardProps = {
    id: 'card-1',
    contentAlt: 'Koala',
    imageSrc: '/images/koala.png',
    isFlipped: false,
    isMatched: false,
    isDisabled: false,
    onFlip,
    ...overrides,
  } as unknown as CardProps;

  const user = userEvent.setup();
  render(<MemoryCard {...props} />);
  const button = screen.getByRole('button', { name: /koala/i }) || screen.getByTestId?.('memory-card');
  return { user, onFlip, button, props };
}

describe('MemoryCard', () => {
  it('renders with minimal required props (happy path)', () => {
    const { button } = setup();
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveAttribute('tabindex', '0');
  });

  it('shows front/back state based on isFlipped', async () => {
    const { rerender } = render(
      <MemoryCard
        id="card-2"
        contentAlt="Panda"
        imageSrc="/images/panda.png"
        isFlipped={false}
        isMatched={false}
        isDisabled={false}
        onFlip={vi.fn?.() || jest.fn()}
      />
    );
    // When not flipped, ensure back-face indicator exists
    expect(screen.getByRole('button', { name: /panda/i })).toHaveAttribute('aria-pressed', 'false');

    // Flip -> true
    const onFlip = vi.fn?.() || jest.fn();
    rerender(
      <MemoryCard
        id="card-2"
        contentAlt="Panda"
        imageSrc="/images/panda.png"
        isFlipped={true}
        isMatched={false}
        isDisabled={false}
        onFlip={onFlip}
      />
    );
    expect(screen.getByRole('button', { name: /panda/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onFlip when clicked if not disabled or matched', async () => {
    const { user, onFlip, button } = setup();
    await user.click(button);
    expect(onFlip).toHaveBeenCalledTimes(1);
    expect(onFlip).toHaveBeenCalledWith('card-1');
  });

  it('does not call onFlip when disabled', async () => {
    const { user, onFlip, button } = setup({ isDisabled: true });
    await user.click(button);
    expect(onFlip).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('tabindex', '-1');
  });

  it('does not call onFlip when already matched', async () => {
    const { user, onFlip, button } = setup({ isMatched: true });
    await user.click(button);
    expect(onFlip).not.toHaveBeenCalled();
    // Matched state may also be aria-pressed true or have data-state
  });

  it('supports keyboard interaction (Enter/Space) to flip', async () => {
    const { user, onFlip, button } = setup();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onFlip).toHaveBeenCalledTimes(2);
  });

  it('applies alt text on image for accessibility', () => {
    setup();
    const img = screen.getByAltText(/koala/i);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/koala.png');
  });

  it('gracefully handles unexpected props (nulls/empties)', async () => {
    const onFlip = vi.fn?.() || jest.fn();
    render(
      <MemoryCard
        // @ts-expect-error testing robustness on bad inputs
        id={''}
        // @ts-expect-error
        contentAlt={null}
        // @ts-expect-error
        imageSrc={undefined}
        isFlipped={false}
        isMatched={false}
        isDisabled={false}
        onFlip={onFlip}
      />
    );
    // Button should still render (fallback labels may apply)
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('matches snapshot for minimal render', () => {
    const { container } = render(
      <MemoryCard
        id="snap-1"
        contentAlt="Owl"
        imageSrc="/images/owl.png"
        isFlipped={false}
        isMatched={false}
        isDisabled={false}
        onFlip={vi.fn?.() || jest.fn()}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
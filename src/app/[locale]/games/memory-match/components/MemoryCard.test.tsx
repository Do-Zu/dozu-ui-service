import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

/**
 * Testing library and framework:
 * - React Testing Library for rendering and interactions
 * - The project's configured test runner (Jest or Vitest) with jest-compatible APIs
 *
 * We mock:
 * - '@/components/ui/card' and '@/components/ui/badge' as simple passthroughs
 * - '@/lib/utils' cn helper to a simple joiner to keep class assertions deterministic
 * - '../context/MemoryMatchContext' to control flip behavior
 */

vi?.mock?.('@/components/ui/card', () => {
  const Card = ({ children, className = '', style = {}, ...rest }: any) => (
    <div data-testid="Card" className={className} style={style} {...rest}>{children}</div>
  );
  const CardContent = ({ children, className = '', ...rest }: any) => (
    <div data-testid="CardContent" className={className} {...rest}>{children}</div>
  );
  return { Card, CardContent };
});
// Fallback for Jest (if vi is not defined)
jest?.mock?.('@/components/ui/card', () => {
  const Card = ({ children, className = '', style = {}, ...rest }: any) => (
    <div data-testid="Card" className={className} style={style} {...rest}>{children}</div>
  );
  const CardContent = ({ children, className = '', ...rest }: any) => (
    <div data-testid="CardContent" className={className} {...rest}>{children}</div>
  );
  return { __esModule: true, Card, CardContent };
});

vi?.mock?.('@/components/ui/badge', () => {
  const Badge = ({ children, className = '', ...rest }: any) => (
    <span data-testid="Badge" className={className} {...rest}>{children}</span>
  );
  return { Badge };
});
jest?.mock?.('@/components/ui/badge', () => {
  const Badge = ({ children, className = '', ...rest }: any) => (
    <span data-testid="Badge" className={className} {...rest}>{children}</span>
  );
  return { __esModule: true, Badge };
});

vi?.mock?.('@/lib/utils', () => ({ cn: (...args: any[]) => args.filter(Boolean).join(' ') }));
jest?.mock?.('@/lib/utils', () => ({ __esModule: true, cn: (...args: any[]) => args.filter(Boolean).join(' ') }));

// Spy-able mocks for the MemoryMatch context
const flipCardMock = jest?.fn?.() || vi?.fn?.();
const canFlipCardMock = jest?.fn?.((id: string) => true) || vi?.fn?.((id: string) => true);

vi?.mock?.('../context/MemoryMatchContext', () => ({
  useMemoryMatch: () => ({ flipCard: flipCardMock, canFlipCard: canFlipCardMock }),
}));
jest?.mock?.('../context/MemoryMatchContext', () => ({
  __esModule: true,
  useMemoryMatch: () => ({ flipCard: flipCardMock, canFlipCard: canFlipCardMock }),
}));

// Import after mocks
// eslint-disable-next-line import/first
import MemoryCard from './MemoryCard'; // same directory as test file

type CardType = 'front' | 'back';
interface IMemoryCard {
  id: string;
  type: CardType;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function makeCard(overrides: Partial<IMemoryCard> = {}): IMemoryCard {
  return {
    id: overrides.id ?? 'card-1',
    type: overrides.type ?? 'front',
    content: overrides.content ?? 'Sample content',
    isFlipped: overrides.isFlipped ?? false,
    isMatched: overrides.isMatched ?? false,
  };
}

describe('MemoryCard component', () => {
  beforeEach(() => {
    flipCardMock && ('mockClear' in flipCardMock) && (flipCardMock as any).mockClear();
    canFlipCardMock && ('mockClear' in canFlipCardMock) && (canFlipCardMock as any).mockClear();
  });

  test('renders with base structure and animation delay based on index', () => {
    const card = makeCard({ isFlipped: false });
    const { container } = render(<MemoryCard card={card} index={3} />);
    // Wrapper div has inline style with animationDelay index * 50ms
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.style.animationDelay).toBe('150ms'); // 3 * 50

    // Inner flipper div should have transformStyle and rotateY(0deg) when not flipped
    const flipper = wrapper.querySelector('div > div') as HTMLElement;
    expect(flipper).toBeInTheDocument();
    expect(flipper.style.transform).toBe('rotateY(0deg)');
    // Should not have rotate-y-180 class when not flipped
    expect(flipper.className).not.toMatch(/\brotate-y-180\b/);
  });

  test('applies flipped styles and classes when card.isFlipped is true', () => {
    const card = makeCard({ isFlipped: true });
    const { container } = render(<MemoryCard card={card} index={0} />);
    const flipper = container.querySelector('div > div') as HTMLElement;
    expect(flipper.style.transform).toBe('rotateY(180deg)');
    expect(flipper.className).toMatch(/\brotate-y-180\b/);

    // Flip glow overlay visible when flipped and not matched
    const glow = container.querySelector('.bg-gradient-to-r.from-purple-400\\/20.to-blue-400\\/20');
    // Class names are joined; use test id alternative by querying with role/text:
    // The overlay is a div without text; assert it exists by selecting by style classes fallback:
    expect(glow).toBeTruthy();
  });

  test('cursor indicates clickability only when not disabled and canFlipCard returns true', () => {
    const card = makeCard();
    (canFlipCardMock as any).mockReturnValueOnce(true);
    const { container, rerender } = render(<MemoryCard card={card} index={0} disabled={false} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toMatch(/\bcursor-pointer\b/);
    expect(wrapper.className).not.toMatch(/\bcursor-not-allowed\b/);

    // When canFlipCard is false
    (canFlipCardMock as any).mockReturnValueOnce(false);
    rerender(<MemoryCard card={card} index={0} disabled={false} />);
    expect(wrapper.className).toMatch(/\bcursor-not-allowed\b/);

    // When disabled is true
    (canFlipCardMock as any).mockReturnValueOnce(true);
    rerender(<MemoryCard card={card} index={0} disabled />);
    expect(wrapper.className).toMatch(/\bcursor-not-allowed\b/);
  });

  test('clicking triggers flipCard only when clickable', () => {
    const card = makeCard({ id: 'abc' });

    // Case 1: clickable -> should call flipCard with id
    (canFlipCardMock as any).mockReturnValueOnce(true);
    const { container, rerender } = render(<MemoryCard card={card} index={0} disabled={false} />);
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(flipCardMock).toHaveBeenCalledTimes(1);
    expect(flipCardMock).toHaveBeenCalledWith('abc');

    // Case 2: disabled -> no call
    (flipCardMock as any).mockClear();
    (canFlipCardMock as any).mockReturnValueOnce(true);
    rerender(<MemoryCard card={card} index={0} disabled />);
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(flipCardMock).not.toHaveBeenCalled();

    // Case 3: canFlipCard false -> no call
    (flipCardMock as any).mockClear();
    (canFlipCardMock as any).mockReturnValueOnce(false);
    rerender(<MemoryCard card={card} index={0} disabled={false} />);
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(flipCardMock).not.toHaveBeenCalled();
  });

  test('badge shows Q for front and A for back', () => {
    const front = makeCard({ type: 'front' });
    render(<MemoryCard card={front} index={0} />);
    expect(screen.getByTestId('Badge')).toHaveTextContent('Q');

    const back = makeCard({ type: 'back' });
    render(<MemoryCard card={back} index={1} />);
    // Find the last rendered badge (second render)
    const badges = screen.getAllByTestId('Badge');
    expect(badges[badges.length - 1]).toHaveTextContent('A');
  });

  test('content text size adjusts by content length thresholds', () => {
    // <= 30 -> text-base
    const c30 = 'x'.repeat(30);
    const card30 = makeCard({ content: c30 });
    const { rerender } = render(<MemoryCard card={card30} index={0} />);
    let contentEl = screen.getByText(c30);
    expect(contentEl.className).toMatch(/\btext-base\b/);
    expect(contentEl.className).not.toMatch(/\btext-sm\b|\btext-xs\b/);

    // 31 -> text-sm
    const c31 = 'y'.repeat(31);
    const card31 = makeCard({ content: c31 });
    rerender(<MemoryCard card={card31} index={0} />);
    contentEl = screen.getByText(c31);
    expect(contentEl.className).toMatch(/\btext-sm\b/);
    expect(contentEl.className).not.toMatch(/\btext-base\b|\btext-xs\b/);

    // > 50 (51) -> text-xs
    const c51 = 'z'.repeat(51);
    const card51 = makeCard({ content: c51 });
    rerender(<MemoryCard card={card51} index={0} />);
    contentEl = screen.getByText(c51);
    expect(contentEl.className).toMatch(/\btext-xs\b/);
    expect(contentEl.className).not.toMatch(/\btext-base\b|\btext-sm\b/);
  });

  test('matched card shows visual indicators and reduces opacity/scale', () => {
    const card = makeCard({ isMatched: true, isFlipped: true });
    const { container } = render(<MemoryCard card={card} index={0} />);
    const wrapper = container.firstElementChild as HTMLElement;

    // Wrapper has matched classes
    expect(wrapper.className).toMatch(/\bscale-95\b/);
    expect(wrapper.className).toMatch(/\bopacity-60\b/);

    // Front card gains green border classes; check one of them
    const frontCards = screen.getAllByTestId('Card');
    const front = frontCards[frontCards.length - 1];
    expect(front.className).toMatch(/border-green-4(00|00)/);

    // Matched overlay with ✅ appears
    expect(screen.getByText('✅')).toBeInTheDocument();

    // No flip glow when matched
    const glow = container.querySelector('.bg-gradient-to-r.from-purple-400\\/20.to-blue-400\\/20');
    expect(glow).toBeNull();
  });

  test('back face label "Memory Card" is present in DOM (backface hidden) irrespective of flip', () => {
    const card = makeCard({ isFlipped: false });
    const { rerender } = render(<MemoryCard card={card} index={0} />);
    expect(screen.getByText('Memory Card')).toBeInTheDocument();

    // Flipped still has backface content in DOM (not visible visually, but present)
    rerender(<MemoryCard card={{ ...card, isFlipped: true }} index={0} />);
    expect(screen.getByText('Memory Card')).toBeInTheDocument();
  });
});
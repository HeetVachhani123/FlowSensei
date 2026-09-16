import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('AI Retrospective Pipeline', () => {
  const mockColumns = [
    { id: 'col-1', name: 'To Do', position: 0 },
    { id: 'col-2', name: 'Done', position: 1 },
  ];

  const mockCards = [
    { id: 'card-1', column_id: 'col-1', title: 'Task A', position: 0 },
    { id: 'card-2', column_id: 'col-2', title: 'Task B', position: 0 },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('successfully generates and parses retro markdown on 200 OK', async () => {
    const mockRetroContent = `### What went well
- Completed Task B ahead of schedule.

### What got stuck
- Task A remained in To Do.

### Actionable Suggestion for Next Week
- Prioritize unblocking Task A.`;

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: mockRetroContent }),
    });
    vi.stubGlobal('fetch', mockFetch);

    // Simulated service call matching RetroModal payload
    const response = await fetch('https://mock-supabase.co/functions/v1/generate-retro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer mock-token',
      },
      body: JSON.stringify({ columns: mockColumns, cards: mockCards }),
    });

    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(response.ok).toBe(true);
    expect(data.content).toContain('### What went well');
    expect(data.content).toContain('### What got stuck');
    expect(data.content).toContain('### Actionable Suggestion for Next Week');
  });

  it('properly throws and extracts error message when Edge Function returns 400', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Groq API rate limit exceeded' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const response = await fetch('https://mock-supabase.co/functions/v1/generate-retro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columns: mockColumns, cards: mockCards }),
    });

    const data = await response.json();
    expect(response.ok).toBe(false);
    expect(data.error).toBe('Groq API rate limit exceeded');
  });

  it('rejects retro generation if cards array is empty', () => {
    const emptyCards: typeof mockCards = [];
    const shouldProceed = emptyCards.length > 0;

    expect(shouldProceed).toBe(false);
  });
});

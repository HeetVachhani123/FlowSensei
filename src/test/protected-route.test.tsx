import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { User, Session } from '@supabase/supabase-js';
import { ProtectedRoute } from '../components/ProtectedRoute';
import * as authHook from '../hooks/useAuth';

vi.mock('../hooks/useAuth');

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading spinner while authentication state is resolving', () => {
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to the login route', () => {
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page Mock</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Dashboard')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page Mock')).toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    vi.spyOn(authHook, 'useAuth').mockReturnValue({
      user: { id: 'user-123', email: 'dev@flowsensei.app' } as unknown as User,
      session: { access_token: 'fake-token' } as unknown as Session,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Secret Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Protected Content')).toBeInTheDocument();
  });
});

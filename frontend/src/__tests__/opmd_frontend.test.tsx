import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import '../i18n/i18n';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext';

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>{component}</BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('OPMD Care Frontend Suite', () => {
  it('renders HomePage hero with primary Screening CTA button', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getByText(/START ORAL SCREENING/i)).toBeDefined();
    expect(screen.getByText(/Find Verified Doctors/i)).toBeDefined();
  });

  it('renders target premalignant conditions (Leukoplakia, Erythroplakia, OSMF)', () => {
    renderWithProviders(<HomePage />);
    expect(screen.getAllByText(/Leukoplakia/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Erythroplakia/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Oral Submucous Fibrosis/i).length).toBeGreaterThan(0);
  });

  it('renders LoginPage with Patient Login and Email or Phone input', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/Patient Login/i)).toBeDefined();
    expect(screen.getByText(/Sign In to Patient Portal/i)).toBeDefined();
    expect(screen.getByPlaceholderText(/your.email@example.com or 9876543210/i)).toBeDefined();
  });

  it('renders RegisterPage with 2-role selection and 3-step registration flow', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getAllByText(/Patient Account/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Doctor \/ Specialist/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Next: Set Password/i)).toBeDefined();
  });
});

/**
 * Mobile App Test Suite
 * Tests mobile oral validation logic, AI lesion detector, All-India state/city directory,
 * and screening data format compatibility.
 */

import { describe, it, expect } from 'vitest';
import { validateOralImageBase64 } from '../utils/oralImageValidator';
import { ALL_INDIA_STATES, getCitiesForState, searchCities } from '../utils/indiaLocations';
import { detectLesionCoordinates } from '../utils/lesionDetector';

describe('OPMD Care Mobile App Test Suite', () => {
  // Test 1: Oral Image Validator (Mobile Base64)
  it('TC-MOB-001: rejects empty or corrupt image base64 data', () => {
    const invalidResult = validateOralImageBase64('');
    expect(invalidResult.isValidOralImage).toBe(false);
    expect(invalidResult.rejectionReason).toBeDefined();
    expect(invalidResult.rejectionReasonTe).toBeDefined();
  });

  it('TC-MOB-002: validates valid clinical oral image base64 data', () => {
    const validBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(200);
    const validResult = validateOralImageBase64(validBase64);
    expect(validResult.isValidOralImage).toBe(true);
    expect(validResult.mucosaScore).toBeGreaterThanOrEqual(70);
  });

  // Test 2: Lesion Coordinates Detector
  it('TC-MOB-003: computes dynamic circular lesion bounding ROI with focal dimensions', async () => {
    const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const roi = await detectLesionCoordinates(sampleDataUrl);
    
    expect(roi.x).toBeGreaterThan(0);
    expect(roi.x).toBeLessThanOrEqual(100);
    expect(roi.y).toBeGreaterThan(0);
    expect(roi.y).toBeLessThanOrEqual(100);
    expect(roi.radius).toBeGreaterThan(0);
    expect(roi.focalAreaMm).toBeDefined();
    expect(roi.confidence).toBeGreaterThan(0);
  });

  // Test 3: All-India Location Directory & Filtering
  it('TC-MOB-004: supports all 28 States and 8 Union Territories in India', () => {
    expect(ALL_INDIA_STATES.length).toBeGreaterThanOrEqual(36);
    expect(ALL_INDIA_STATES).toContain('Telangana');
    expect(ALL_INDIA_STATES).toContain('Andhra Pradesh');
    expect(ALL_INDIA_STATES).toContain('Maharashtra');
    expect(ALL_INDIA_STATES).toContain('Delhi NCR');
    expect(ALL_INDIA_STATES).toContain('Karnataka');
    expect(ALL_INDIA_STATES).toContain('Tamil Nadu');
  });

  it('TC-MOB-005: dynamically retrieves cities for selected state', () => {
    const tsCities = getCitiesForState('Telangana');
    expect(tsCities).toContain('Hyderabad');
    expect(tsCities).toContain('Warangal');

    const apCities = getCitiesForState('Andhra Pradesh');
    expect(apCities).toContain('Visakhapatnam');
    expect(apCities).toContain('Vijayawada');
  });

  it('TC-MOB-006: searches cities with case-insensitive partial match across India', () => {
    const hydResults = searchCities('hyder');
    expect(hydResults.length).toBeGreaterThan(0);
    expect(hydResults[0].city).toBe('Hyderabad');
    expect(hydResults[0].state).toBe('Telangana');

    const blrResults = searchCities('bengaluru');
    expect(blrResults.length).toBeGreaterThan(0);
    expect(blrResults[0].city).toBe('Bengaluru');
  });
});

import { describe, expect, it } from 'vitest';

// Import the function directly from the input.tsx file
import { getInputTypeAndAutocomplete } from './input';

describe('getInputTypeAndAutocomplete', () => {
  // Test default behavior
  it('should return defaults when no input type is provided', () => {
    expect(getInputTypeAndAutocomplete('')).toEqual({ type: 'text', autocomplete: 'on' });
    expect(getInputTypeAndAutocomplete(undefined as unknown as string)).toEqual({ type: 'text', autocomplete: 'on' });
    expect(getInputTypeAndAutocomplete(null as unknown as string)).toEqual({ type: 'text', autocomplete: 'on' });
  });

  // Test basic HTML input types
  it('should handle basic HTML input types with autocomplete on', () => {
    expect(getInputTypeAndAutocomplete('text')).toEqual({ type: 'text', autocomplete: 'on' });
    expect(getInputTypeAndAutocomplete('password')).toEqual({ type: 'password', autocomplete: 'on' });
    expect(getInputTypeAndAutocomplete('number')).toEqual({ type: 'number', autocomplete: 'on' });
    expect(getInputTypeAndAutocomplete('hidden')).toEqual({ type: 'hidden', autocomplete: 'on' });
    expect(getInputTypeAndAutocomplete('range')).toEqual({ type: 'range', autocomplete: 'on' });
    expect(getInputTypeAndAutocomplete('color')).toEqual({ type: 'color', autocomplete: 'on' });
    expect(getInputTypeAndAutocomplete('date')).toEqual({ type: 'date', autocomplete: 'on' });
    expect(getInputTypeAndAutocomplete('time')).toEqual({ type: 'time', autocomplete: 'on' });
  });
  
  // Test input types with matching autocomplete values
  it('should handle input types with matching autocomplete values', () => {
    expect(getInputTypeAndAutocomplete('email')).toEqual({ type: 'email', autocomplete: 'email' });
    expect(getInputTypeAndAutocomplete('tel')).toEqual({ type: 'tel', autocomplete: 'tel' });
    expect(getInputTypeAndAutocomplete('url')).toEqual({ type: 'url', autocomplete: 'url' });
  });

  // Test special cases
  it('should handle special autocomplete values', () => {
    expect(getInputTypeAndAutocomplete('off')).toEqual({ type: 'text', autocomplete: 'off' });
    expect(getInputTypeAndAutocomplete('on')).toEqual({ type: 'text', autocomplete: 'on' });
  });

  // Test name-related fields
  it('should handle name-related fields', () => {
    expect(getInputTypeAndAutocomplete('name')).toEqual({ type: 'text', autocomplete: 'name' });
    expect(getInputTypeAndAutocomplete('honorific-prefix')).toEqual({ type: 'text', autocomplete: 'honorific-prefix' });
    expect(getInputTypeAndAutocomplete('given-name')).toEqual({ type: 'text', autocomplete: 'given-name' });
    expect(getInputTypeAndAutocomplete('additional-name')).toEqual({ type: 'text', autocomplete: 'additional-name' });
    expect(getInputTypeAndAutocomplete('family-name')).toEqual({ type: 'text', autocomplete: 'family-name' });
    expect(getInputTypeAndAutocomplete('honorific-suffix')).toEqual({ type: 'text', autocomplete: 'honorific-suffix' });
    expect(getInputTypeAndAutocomplete('nickname')).toEqual({ type: 'text', autocomplete: 'nickname' });
    expect(getInputTypeAndAutocomplete('firstName')).toEqual({ type: 'text', autocomplete: 'given-name' });
    expect(getInputTypeAndAutocomplete('lastName')).toEqual({ type: 'text', autocomplete: 'family-name' });
  });

  // Test contact-related fields
  it('should handle contact-related fields', () => {
    expect(getInputTypeAndAutocomplete('email')).toEqual({ type: 'email', autocomplete: 'email' });
    expect(getInputTypeAndAutocomplete('tel')).toEqual({ type: 'tel', autocomplete: 'tel' });
    expect(getInputTypeAndAutocomplete('tel-country-code')).toEqual({ type: 'tel', autocomplete: 'tel-country-code' });
    expect(getInputTypeAndAutocomplete('tel-national')).toEqual({ type: 'tel', autocomplete: 'tel-national' });
    expect(getInputTypeAndAutocomplete('tel-area-code')).toEqual({ type: 'tel', autocomplete: 'tel-area-code' });
    expect(getInputTypeAndAutocomplete('tel-local')).toEqual({ type: 'tel', autocomplete: 'tel-local' });
    expect(getInputTypeAndAutocomplete('tel-extension')).toEqual({ type: 'tel', autocomplete: 'tel-extension' });
  });

  // Test address-related fields
  it('should handle address-related fields', () => {
    expect(getInputTypeAndAutocomplete('street-address')).toEqual({ type: 'text', autocomplete: 'street-address' });
    expect(getInputTypeAndAutocomplete('address-line1')).toEqual({ type: 'text', autocomplete: 'address-line1' });
    expect(getInputTypeAndAutocomplete('address-line2')).toEqual({ type: 'text', autocomplete: 'address-line2' });
    expect(getInputTypeAndAutocomplete('address-line3')).toEqual({ type: 'text', autocomplete: 'address-line3' });
    expect(getInputTypeAndAutocomplete('address-level1')).toEqual({ type: 'text', autocomplete: 'address-level1' });
    expect(getInputTypeAndAutocomplete('address-level2')).toEqual({ type: 'text', autocomplete: 'address-level2' });
    expect(getInputTypeAndAutocomplete('address-level3')).toEqual({ type: 'text', autocomplete: 'address-level3' });
    expect(getInputTypeAndAutocomplete('address-level4')).toEqual({ type: 'text', autocomplete: 'address-level4' });
    expect(getInputTypeAndAutocomplete('country')).toEqual({ type: 'text', autocomplete: 'country' });
    expect(getInputTypeAndAutocomplete('country-name')).toEqual({ type: 'text', autocomplete: 'country-name' });
    expect(getInputTypeAndAutocomplete('postal-code')).toEqual({ type: 'text', autocomplete: 'postal-code' });
  });

  // Test credit card-related fields
  it('should handle credit card-related fields', () => {
    expect(getInputTypeAndAutocomplete('cc-name')).toEqual({ type: 'text', autocomplete: 'cc-name' });
    expect(getInputTypeAndAutocomplete('cc-given-name')).toEqual({ type: 'text', autocomplete: 'cc-given-name' });
    expect(getInputTypeAndAutocomplete('cc-additional-name')).toEqual({ type: 'text', autocomplete: 'cc-additional-name' });
    expect(getInputTypeAndAutocomplete('cc-family-name')).toEqual({ type: 'text', autocomplete: 'cc-family-name' });
    expect(getInputTypeAndAutocomplete('cc-number')).toEqual({ type: 'text', autocomplete: 'cc-number' });
    expect(getInputTypeAndAutocomplete('cc-exp')).toEqual({ type: 'text', autocomplete: 'cc-exp' });
    expect(getInputTypeAndAutocomplete('cc-exp-month')).toEqual({ type: 'number', autocomplete: 'cc-exp-month' });
    expect(getInputTypeAndAutocomplete('cc-exp-year')).toEqual({ type: 'number', autocomplete: 'cc-exp-year' });
    expect(getInputTypeAndAutocomplete('cc-csc')).toEqual({ type: 'text', autocomplete: 'cc-csc' });
    expect(getInputTypeAndAutocomplete('cc-type')).toEqual({ type: 'text', autocomplete: 'cc-type' });
  });

  // Test date-related fields
  it('should handle date-related fields', () => {
    expect(getInputTypeAndAutocomplete('bday')).toEqual({ type: 'date', autocomplete: 'bday' });
    expect(getInputTypeAndAutocomplete('bday-day')).toEqual({ type: 'number', autocomplete: 'bday-day' });
    expect(getInputTypeAndAutocomplete('bday-month')).toEqual({ type: 'number', autocomplete: 'bday-month' });
    expect(getInputTypeAndAutocomplete('bday-year')).toEqual({ type: 'number', autocomplete: 'bday-year' });
  });

  // Test login-related fields
  it('should handle login-related fields', () => {
    expect(getInputTypeAndAutocomplete('username')).toEqual({ type: 'text', autocomplete: 'username' });
    expect(getInputTypeAndAutocomplete('new-password')).toEqual({ type: 'password', autocomplete: 'new-password' });
    expect(getInputTypeAndAutocomplete('current-password')).toEqual({ type: 'password', autocomplete: 'current-password' });
    expect(getInputTypeAndAutocomplete('one-time-code')).toEqual({ type: 'text', autocomplete: 'one-time-code' });
  });

  // Test transaction-related fields
  it('should handle transaction-related fields', () => {
    expect(getInputTypeAndAutocomplete('transaction-currency')).toEqual({ type: 'text', autocomplete: 'transaction-currency' });
    expect(getInputTypeAndAutocomplete('transaction-amount')).toEqual({ type: 'number', autocomplete: 'transaction-amount' });
  });

  // Test other fields
  it('should handle other fields', () => {
    expect(getInputTypeAndAutocomplete('url')).toEqual({ type: 'url', autocomplete: 'url' });
    expect(getInputTypeAndAutocomplete('photo')).toEqual({ type: 'url', autocomplete: 'photo' });
    expect(getInputTypeAndAutocomplete('sex')).toEqual({ type: 'text', autocomplete: 'sex' });
    expect(getInputTypeAndAutocomplete('organization-title')).toEqual({ type: 'text', autocomplete: 'organization-title' });
    expect(getInputTypeAndAutocomplete('organization')).toEqual({ type: 'text', autocomplete: 'organization' });
    expect(getInputTypeAndAutocomplete('language')).toEqual({ type: 'text', autocomplete: 'language' });
  });

  // Test unknown values
  it('should handle unknown values by returning defaults', () => {
    expect(getInputTypeAndAutocomplete('unknown-value')).toEqual({ type: 'text', autocomplete: 'on' });
    expect(getInputTypeAndAutocomplete('custom-field')).toEqual({ type: 'text', autocomplete: 'on' });
  });
});

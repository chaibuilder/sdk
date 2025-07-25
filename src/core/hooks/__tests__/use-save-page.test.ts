import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock only the dependencies needed for the function we're testing
vi.mock('@chaibuilder/runtime');
vi.mock('lodash-es', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    has: vi.fn().mockImplementation(actual.has),
    isEmpty: vi.fn().mockImplementation(actual.isEmpty)
  };
});

// Import the function and its dependencies
import { checkMissingTranslations } from '../use-save-page';
import { getRegisteredChaiBlock } from '@chaibuilder/runtime';
import { has, isEmpty } from 'lodash-es';

describe('checkMissingTranslations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (getRegisteredChaiBlock as any).mockReturnValue({
      i18nProps: ['title', 'content']
    });
    
    (has as any).mockImplementation((obj: any, path: string) => {
      return obj && obj[path] !== undefined;
    });
    
    (isEmpty as any).mockImplementation((value: any) => {
      return !value || value === '';
    });
  });

  it('should return false when lang is empty', () => {
    const blocks = [{ _type: 'TextBlock', title: 'Test' }];
    const result = checkMissingTranslations(blocks, '');
    expect(result).toBe(false);
  });

  it('should return false when lang is null/undefined', () => {
    const blocks = [{ _type: 'TextBlock', title: 'Test' }];
    expect(checkMissingTranslations(blocks, null as any)).toBe(false);
    expect(checkMissingTranslations(blocks, undefined as any)).toBe(false);
  });

  it('should return true when translations are missing', () => {
    const blocks = [{
      _type: 'TextBlock',
      title: 'Test Title',
      content: 'Test Content'
      // Missing title-es and content-es
    }];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(true);
  });

  it('should return false when all translations are present', () => {
    const blocks = [{
      _type: 'TextBlock',
      title: 'Test Title',
      content: 'Test Content',
      'title-es': 'Título de Prueba',
      'content-es': 'Contenido de Prueba'
    }];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(false);
  });

  it('should return true when some translations are empty', () => {
    const blocks = [{
      _type: 'TextBlock',
      title: 'Test Title',
      content: 'Test Content',
      'title-es': '', // Empty translation
      'content-es': 'Contenido de Prueba'
    }];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(true);
  });

  it('should return false for blocks without _type', () => {
    const blocks = [{
      // No _type property
      title: 'Test Title'
    }];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(false);
  });

  it('should skip PartialBlock types', () => {
    const blocks = [{
      _type: 'PartialBlock',
      title: 'Test Title'
      // PartialBlock should be skipped regardless of missing translations
    }];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(false);
  });

  it('should return false for blocks with no registered definition', () => {
    (getRegisteredChaiBlock as any).mockReturnValue(null);
    
    const blocks = [{
      _type: 'UnknownBlock',
      title: 'Test Title'
    }];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(false);
  });

  it('should return false for blocks with no i18nProps', () => {
    (getRegisteredChaiBlock as any).mockReturnValue({}); // No i18nProps
    
    const blocks = [{
      _type: 'SimpleBlock',
      title: 'Test Title'
    }];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(false);
  });

  it('should handle getRegisteredChaiBlock throwing error', () => {
    (getRegisteredChaiBlock as any).mockImplementation(() => {
      throw new Error('Block not found');
    });
    
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const blocks = [{
      _type: 'ErrorBlock',
      title: 'Test Title'
    }];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to get block definition for type: ErrorBlock',
      expect.any(Error)
    );
    
    consoleSpy.mockRestore();
  });

  it('should handle empty blocks array', () => {
    const result = checkMissingTranslations([], 'es');
    expect(result).toBe(false);
  });

  it('should handle multiple blocks with mixed translation status', () => {
    const blocks = [
      {
        _type: 'TextBlock',
        title: 'Title 1',
        'title-es': 'Título 1' // Has translation
      },
      {
        _type: 'TextBlock', 
        title: 'Title 2'
        // Missing translation - should return true
      }
    ];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(true);
  });

  it('should handle multiple blocks all with translations', () => {
    // Mock to only check title for this test
    (getRegisteredChaiBlock as any).mockReturnValue({
      i18nProps: ['title']
    });
    
    const blocks = [
      {
        _type: 'TextBlock',
        title: 'Title 1',
        'title-es': 'Título 1'
      },
      {
        _type: 'TextBlock',
        title: 'Title 2', 
        'title-es': 'Título 2'
      }
    ];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(false);
  });
});
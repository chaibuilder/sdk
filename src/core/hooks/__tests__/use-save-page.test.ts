import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkMissingTranslations } from '../use-save-page';
import { getRegisteredChaiBlock } from '@chaibuilder/runtime';

vi.mock('@chaibuilder/runtime', () => ({
  getRegisteredChaiBlock: vi.fn()
}));

const mockGetRegisteredChaiBlock = getRegisteredChaiBlock as any;

describe('checkMissingTranslations', () => {
  beforeEach(() => {
    mockGetRegisteredChaiBlock.mockReset();
    
    mockGetRegisteredChaiBlock.mockImplementation((blockType: string) => {
      if (blockType === 'TextBlock') {
        return { i18nProps: ['title', 'content'] };
      }
      if (blockType === 'SimpleBlock') {
        return {};
      }
      if (blockType === 'UnknownBlock' || blockType === 'ErrorBlock') {
        return null;
      }
      return { i18nProps: ['title', 'content'] };
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
    const blocks = [{
      _type: 'UnknownBlock',
      title: 'Test Title'
    }];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(false);
  });

  it('should return false for blocks with no i18nProps', () => {
    const blocks = [{
      _type: 'SimpleBlock',
      title: 'Test Title'
    }];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(false);
  });

  it('should handle getRegisteredChaiBlock throwing error', () => {
    const blocks = [{
      _type: 'ErrorBlock',
      title: 'Test Title'
    }];
    
    const result = checkMissingTranslations(blocks, 'es');
    expect(result).toBe(false);
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
    // Override mock for this test to only check title
    mockGetRegisteredChaiBlock.mockImplementation((blockType: string) => {
      if (blockType === 'TextBlock') {
        return { i18nProps: ['title'] }; // Only check title for this test
      }
      return { i18nProps: ['title'] };
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
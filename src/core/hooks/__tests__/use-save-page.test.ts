import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock all the dependencies before importing the hook
vi.mock('@/core/hooks/use-builder-prop');
vi.mock('@/core/hooks/use-get-page-data');
vi.mock('@/core/hooks/use-permissions');
vi.mock('@/core/hooks/use-theme');
vi.mock('@/core/hooks/use-languages');
vi.mock('@react-hookz/web');
vi.mock('@chaibuilder/runtime');
vi.mock('jotai', () => ({
  atom: vi.fn(() => ({ debugLabel: '' })),
  useAtom: vi.fn(),
  getDefaultStore: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    sub: vi.fn()
  }))
}));
vi.mock('lodash-es', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    has: vi.fn().mockImplementation(actual.has),
    isEmpty: vi.fn().mockImplementation(actual.isEmpty),
    noop: vi.fn().mockImplementation(actual.noop)
  };
});

// Import mocked modules
import { useBuilderProp } from '@/core/hooks/use-builder-prop';
import { useGetPageData } from '@/core/hooks/use-get-page-data';
import { usePermissions } from '@/core/hooks/use-permissions';
import { useTheme } from '@/core/hooks/use-theme';
import { useLanguages } from '@/core/hooks/use-languages';
import { useThrottledCallback } from '@react-hookz/web';
import { getRegisteredChaiBlock } from '@chaibuilder/runtime';
import { useAtom } from 'jotai';
import { has, isEmpty } from 'lodash-es';

// Now import the hook after mocking dependencies
import { useSavePage } from '../use-save-page';

// Create mock functions
const mockOnSave = vi.fn();
const mockOnSaveStateChange = vi.fn();
const mockSetSaveState = vi.fn();
const mockGetPageData = vi.fn();

// Mock block definitions
const mockBlockDef = {
  i18nProps: ['title', 'content']
};

describe('useSavePage', () => {
  const mockPageData = {
    blocks: [
      {
        _type: 'TextBlock',
        id: '1',
        title: 'Test Title',
        content: 'Test Content'
      },
      {
        _type: 'ImageBlock',
        id: '2',
        alt: 'Test Alt'
      }
    ]
  };

  const mockTheme = {
    colors: { primary: '#000000' }
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock implementations
    (useBuilderProp as any).mockImplementation((prop: string, defaultValue: any) => {
      if (prop === 'onSave') return mockOnSave;
      if (prop === 'onSaveStateChange') return mockOnSaveStateChange;
      return defaultValue;
    });

    (useGetPageData as any).mockReturnValue(mockGetPageData);
    mockGetPageData.mockReturnValue(mockPageData);
    (usePermissions as any).mockReturnValue({ hasPermission: vi.fn().mockReturnValue(true) });
    (useTheme as any).mockReturnValue([mockTheme]);
    (useLanguages as any).mockReturnValue({
      selectedLang: 'en',
      fallbackLang: 'en'
    });

    (useAtom as any).mockReturnValue(['SAVED', mockSetSaveState]);

    (useThrottledCallback as any).mockImplementation((callback, deps, delay) => {
      // Return the actual callback function for testing
      return callback;
    });

    (getRegisteredChaiBlock as any).mockReturnValue(mockBlockDef);
    
    // Mock lodash functions
    (has as any).mockImplementation((obj: any, path: string) => {
      return obj && obj[path] !== undefined;
    });
    (isEmpty as any).mockImplementation((value: any) => {
      return !value || value === '';
    });

    // Mock setTimeout
    vi.useFakeTimers();
  });

  describe('savePage function', () => {
    it('should save page successfully with default parameters', async () => {
      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePage();
      });

      expect(mockSetSaveState).toHaveBeenCalledWith('SAVING');
      expect(mockOnSaveStateChange).toHaveBeenCalledWith('SAVING');
      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: false,
        blocks: mockPageData.blocks,
        theme: mockTheme,
        needTranslations: false
      });

      // Fast-forward timers to trigger setTimeout
      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(mockSetSaveState).toHaveBeenCalledWith('SAVED');
      expect(mockOnSaveStateChange).toHaveBeenCalledWith('SAVED');
    });

    it('should save page with autoSave parameter', async () => {
      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePage(true);
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: true,
        blocks: mockPageData.blocks,
        theme: mockTheme,
        needTranslations: false
      });
    });

    it('should not save if user lacks permission', async () => {
      (usePermissions as any).mockReturnValue({ 
        hasPermission: vi.fn().mockReturnValue(false) 
      });

      const { result } = renderHook(() => useSavePage());

      const saveResult = await act(async () => {
        return await result.current.savePage();
      });

      expect(saveResult).toBeUndefined();
      expect(mockSetSaveState).not.toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should detect missing translations when selectedLang differs from fallbackLang', async () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });

      // Mock blocks with missing translations
      const blocksWithMissingTranslations = [
        {
          _type: 'TextBlock',
          id: '1',
          title: 'Test Title',
          // Missing title-es and content-es
        }
      ];

      mockGetPageData.mockReturnValue({
        blocks: blocksWithMissingTranslations
      });

      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePage();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: false,
        blocks: blocksWithMissingTranslations,
        theme: mockTheme,
        needTranslations: true
      });
    });

    it('should not check translations when selectedLang equals fallbackLang', async () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'en',
        fallbackLang: 'en'
      });

      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePage();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: false,
        blocks: mockPageData.blocks,
        theme: mockTheme,
        needTranslations: false
      });
    });

    it('should handle blocks with complete translations', async () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });

      const blocksWithTranslations = [
        {
          _type: 'TextBlock',
          id: '1',
          title: 'Test Title',
          'title-es': 'Título de Prueba',
          content: 'Test Content',
          'content-es': 'Contenido de Prueba'
        }
      ];

      mockGetPageData.mockReturnValue({
        blocks: blocksWithTranslations
      });

      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePage();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: false,
        blocks: blocksWithTranslations,
        theme: mockTheme,
        needTranslations: false
      });
    });

    it('should skip PartialBlock types in translation check', async () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });

      const blocksWithPartialBlock = [
        {
          _type: 'PartialBlock',
          id: '1',
          // No translations needed for PartialBlock
        },
        {
          _type: 'TextBlock',
          id: '2',
          title: 'Test Title',
          'title-es': 'Título de Prueba',
          content: 'Test Content',
          'content-es': 'Contenido de Prueba'
        }
      ];

      mockGetPageData.mockReturnValue({
        blocks: blocksWithPartialBlock
      });

      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePage();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: false,
        blocks: blocksWithPartialBlock,
        theme: mockTheme,
        needTranslations: false
      });
    });
  });

  describe('savePageAsync function', () => {
    it('should save page asynchronously', async () => {
      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePageAsync();
      });

      expect(mockSetSaveState).toHaveBeenCalledWith('SAVING');
      expect(mockOnSaveStateChange).toHaveBeenCalledWith('SAVING');
      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: true,
        blocks: mockPageData.blocks,
        theme: mockTheme,
        needTranslations: false
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(mockSetSaveState).toHaveBeenCalledWith('SAVED');
      expect(mockOnSaveStateChange).toHaveBeenCalledWith('SAVED');
    });

    it('should not save async if user lacks permission', async () => {
      (usePermissions as any).mockReturnValue({ 
        hasPermission: vi.fn().mockReturnValue(false) 
      });

      const { result } = renderHook(() => useSavePage());

      const saveResult = await act(async () => {
        return await result.current.savePageAsync();
      });

      expect(saveResult).toBeUndefined();
      expect(mockSetSaveState).not.toHaveBeenCalled();
      expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('should handle translation detection in async save', async () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'fr',
        fallbackLang: 'en'
      });

      const blocksWithMissingTranslations = [
        {
          _type: 'TextBlock',
          id: '1',
          title: 'Test Title',
          // Missing title-fr and content-fr
        }
      ];

      mockGetPageData.mockReturnValue({
        blocks: blocksWithMissingTranslations
      });

      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePageAsync();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: true,
        blocks: blocksWithMissingTranslations,
        theme: mockTheme,
        needTranslations: true
      });
    });
  });

  describe('saveState management', () => {
    it('should return current save state', () => {
      (useAtom as any).mockReturnValue(['SAVING', mockSetSaveState]);

      const { result } = renderHook(() => useSavePage());

      expect(result.current.saveState).toBe('SAVING');
    });

    it('should provide setSaveState function', () => {
      const { result } = renderHook(() => useSavePage());

      expect(result.current.setSaveState).toBe(mockSetSaveState);
    });
  });

  describe('checkMissingTranslations helper', () => {
    it('should return false when lang is empty', async () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: '',
        fallbackLang: 'en'
      });

      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePage();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: false,
        blocks: mockPageData.blocks,
        theme: mockTheme,
        needTranslations: false
      });
    });

    it('should handle blocks without i18nProps', async () => {
      (getRegisteredChaiBlock as any).mockReturnValue({}); // No i18nProps
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });

      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePage();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: false,
        blocks: mockPageData.blocks,
        theme: mockTheme,
        needTranslations: false
      });
    });

    it('should handle empty translation values', async () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });

      const blocksWithEmptyTranslations = [
        {
          _type: 'TextBlock',
          id: '1',
          title: 'Test Title',
          'title-es': '', // Empty translation
          content: 'Test Content',
          'content-es': 'Contenido de Prueba'
        }
      ];

      mockGetPageData.mockReturnValue({
        blocks: blocksWithEmptyTranslations
      });

      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePage();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: false,
        blocks: blocksWithEmptyTranslations,
        theme: mockTheme,
        needTranslations: true
      });
    });
  });

  describe('error handling', () => {
    it('should handle onSave errors gracefully', async () => {
      mockOnSave.mockRejectedValueOnce(new Error('Save failed'));

      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        try {
          await result.current.savePage();
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('Save failed');
        }
      });

      expect(mockSetSaveState).toHaveBeenCalledWith('SAVING');
      expect(mockOnSave).toHaveBeenCalled();
    });

    it('should handle getPageData returning undefined blocks', async () => {
      mockGetPageData.mockReturnValue({ blocks: undefined });

      const { result } = renderHook(() => useSavePage());

      await act(async () => {
        await result.current.savePage();
      });

      expect(mockOnSave).toHaveBeenCalledWith({
        autoSave: false,
        blocks: undefined,
        theme: mockTheme,
        needTranslations: false
      });
    });
  });

  describe('throttling behavior', () => {
    it('should use throttled callback with correct parameters', () => {
      renderHook(() => useSavePage());

      expect(useThrottledCallback).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Array),
        3000
      );
    });

    it('should include correct dependencies in throttled callback', () => {
      renderHook(() => useSavePage());

      const [, dependencies] = (useThrottledCallback as any).mock.calls[0];
      expect(dependencies).toEqual([
        expect.any(Function), // mockGetPageData function
        mockSetSaveState,
        mockTheme,
        mockOnSave,
        mockOnSaveStateChange
      ]);
    });
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// Mock only the dependencies needed for the functions we're testing
vi.mock('@chaibuilder/runtime');
vi.mock('@/core/hooks/use-get-page-data');
vi.mock('@/core/hooks/use-languages');

// Import the minimal dependencies
import { getRegisteredChaiBlock } from '@chaibuilder/runtime';
import { useGetPageData } from '@/core/hooks/use-get-page-data';
import { useLanguages } from '@/core/hooks/use-languages';

// Mock the other hook dependencies to prevent errors
vi.mock('@/core/hooks/use-builder-prop', () => ({
  useBuilderProp: vi.fn(() => vi.fn())
}));
vi.mock('@/core/hooks/use-permissions', () => ({
  usePermissions: vi.fn(() => ({ hasPermission: vi.fn(() => true) }))
}));
vi.mock('@/core/hooks/use-theme', () => ({
  useTheme: vi.fn(() => [{}])
}));
vi.mock('@react-hookz/web', () => ({
  useThrottledCallback: vi.fn((fn) => fn)
}));
vi.mock('jotai', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    atom: vi.fn(() => ({ debugLabel: '' })),
    useAtom: vi.fn(() => ['SAVED', vi.fn()]),
    getDefaultStore: vi.fn(() => ({
      get: vi.fn(),
      set: vi.fn(),
      sub: vi.fn()
    }))
  };
});

// Import the hook
import { useSavePage } from '../use-save-page';

describe('useSavePage - checkMissingTranslations and needTranslations', () => {
  const mockGetPageData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup minimal mocks
    (useGetPageData as any).mockReturnValue(mockGetPageData);
    (useLanguages as any).mockReturnValue({
      selectedLang: 'en',
      fallbackLang: 'en'
    });
    (getRegisteredChaiBlock as any).mockReturnValue({
      i18nProps: ['title', 'content']
    });
  });

  describe('needTranslations function', () => {
    it('should return false when selectedLang equals fallbackLang', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'en',
        fallbackLang: 'en'
      });
      
      mockGetPageData.mockReturnValue({
        blocks: [{ _type: 'TextBlock', title: 'Test' }]
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(false);
    });

    it('should return false when selectedLang is empty', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: '',
        fallbackLang: 'en'
      });
      
      mockGetPageData.mockReturnValue({
        blocks: [{ _type: 'TextBlock', title: 'Test' }]
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(false);
    });

    it('should return false when selectedLang is null/undefined', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: null,
        fallbackLang: 'en'
      });
      
      mockGetPageData.mockReturnValue({
        blocks: [{ _type: 'TextBlock', title: 'Test' }]
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(false);
    });

    it('should return true when translations are missing', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });
      
      mockGetPageData.mockReturnValue({
        blocks: [{
          _type: 'TextBlock',
          title: 'Test Title',
          content: 'Test Content'
          // Missing title-es and content-es
        }]
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(true);
    });

    it('should return false when all translations are present', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });
      
      mockGetPageData.mockReturnValue({
        blocks: [{
          _type: 'TextBlock',
          title: 'Test Title',
          content: 'Test Content',
          'title-es': 'Título de Prueba',
          'content-es': 'Contenido de Prueba'
        }]
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(false);
    });

    it('should return true when some translations are empty', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });
      
      mockGetPageData.mockReturnValue({
        blocks: [{
          _type: 'TextBlock',
          title: 'Test Title',
          content: 'Test Content',
          'title-es': '', // Empty translation
          'content-es': 'Contenido de Prueba'
        }]
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(true);
    });

    it('should handle blocks without _type', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });
      
      mockGetPageData.mockReturnValue({
        blocks: [{
          // No _type property
          title: 'Test Title'
        }]
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(false);
    });

    it('should skip PartialBlock types', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });
      
      mockGetPageData.mockReturnValue({
        blocks: [{
          _type: 'PartialBlock',
          title: 'Test Title'
          // PartialBlock should be skipped regardless of missing translations
        }]
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(false);
    });

    it('should handle blocks with no registered definition', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });
      
      (getRegisteredChaiBlock as any).mockReturnValue(null);
      
      mockGetPageData.mockReturnValue({
        blocks: [{
          _type: 'UnknownBlock',
          title: 'Test Title'
        }]
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(false);
    });

    it('should handle blocks with no i18nProps', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });
      
      (getRegisteredChaiBlock as any).mockReturnValue({}); // No i18nProps
      
      mockGetPageData.mockReturnValue({
        blocks: [{
          _type: 'SimpleBlock',
          title: 'Test Title'
        }]
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(false);
    });

    it('should handle getRegisteredChaiBlock throwing error', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });
      
      (getRegisteredChaiBlock as any).mockImplementation(() => {
        throw new Error('Block not found');
      });
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockGetPageData.mockReturnValue({
        blocks: [{
          _type: 'ErrorBlock',
          title: 'Test Title'
        }]
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to get block definition for type: ErrorBlock',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle undefined or null blocks array', () => {
      (useLanguages as any).mockReturnValue({
        selectedLang: 'es',
        fallbackLang: 'en'
      });
      
      mockGetPageData.mockReturnValue({
        blocks: null
      });

      const { result } = renderHook(() => useSavePage());
      expect(result.current.needTranslations()).toBe(false);
    });
  });
});
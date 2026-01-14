import { renderHook, act } from '@testing-library/react';
import { useBlocksStoreManager } from './use-blocks-store-manager';
import { builderStore } from '../atoms/store';
import { presentBlocksAtom } from '../atoms/blocks';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ChaiBlock } from '@/types/chai-block';

// Mock dependencies
vi.mock('../hooks/use-broadcast-channel', () => ({
  useBroadcastChannel: () => ({ postMessage: vi.fn() }),
}));

vi.mock('../components/use-auto-save', () => ({
  useIncrementActionsCount: () => vi.fn(),
  userActionsCountAtom: { key: 'userActionsCountAtom', toString: () => 'userActionsCountAtom', debugLabel: 'userActionsCountAtom' },
}));

const mockRunValidation = vi.fn();
vi.mock('../hooks/use-check-structure', () => ({
  useCheckStructure: () => mockRunValidation,
}));

vi.mock('@/core/hooks/use-update-block-atom', () => ({
  useUpdateBlockAtom: () => (({ id, props }: { id: string; props: Record<string, any> }) => {
    // Manually update the store for the test
    const currentBlocks = builderStore.get(presentBlocksAtom) as ChaiBlock[];
    const updatedBlocks = currentBlocks.map(block =>
      block._id === id ? { ...block, ...props } : block
    );
    builderStore.set(presentBlocksAtom, updatedBlocks);
  }),
}));

vi.mock('./use-blocks-store-undoable-actions', () => ({
  useBlocksStore: () => {
    // Mock implementation of useBlocksStore that reads from builderStore
    return [
       builderStore.get(presentBlocksAtom),
       (updater: any) => {
         if (typeof updater === 'function') {
           const newVal = updater(builderStore.get(presentBlocksAtom));
           builderStore.set(presentBlocksAtom, newVal);
         } else {
           builderStore.set(presentBlocksAtom, updater);
         }
       }
    ];
  }
}));


describe('useBlocksStoreManager', () => {
  beforeEach(() => {
    // Reset store
    builderStore.set(presentBlocksAtom, []);
    mockRunValidation.mockClear();
  });

  it('should run validation when updateBlocksProps is called', () => {
    // Setup initial blocks
    const initialBlocks: ChaiBlock[] = [
      { _id: 'block1', _type: 'Box', _parent: null },
      { _id: 'block2', _type: 'Text', _parent: 'block1' },
    ];
    builderStore.set(presentBlocksAtom, initialBlocks);

    const { result } = renderHook(() => useBlocksStoreManager());

    // Update block props
    const updates = [{ _id: 'block1', _type: 'Box', newProp: 'value' }];

    act(() => {
      result.current.updateBlocksProps(updates);
    });

    // Check if validation was called
    expect(mockRunValidation).toHaveBeenCalledTimes(1);

    // Check if validation was called with updated blocks
    // Note: useUpdateBlockAtom mock updates the store synchronously
    const expectedBlocks = [
        { _id: 'block1', _type: 'Box', _parent: null, newProp: 'value' },
        { _id: 'block2', _type: 'Text', _parent: 'block1' },
    ];
    expect(mockRunValidation).toHaveBeenCalledWith(expectedBlocks);
  });
});

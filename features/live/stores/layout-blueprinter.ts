import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Blueprint, BlueprintColumn } from "~/types/blueprint";

interface LayoutBlueprintState {
  blueprint: Blueprint;
  isEditMode: boolean;
}

interface LayoutBlueprintActions {
  addColumn: (column: BlueprintColumn) => void;
  removeColumn: (index: number) => void;
  updateColumn: (index: number, column: BlueprintColumn) => void;
  setBlueprint: (blueprint: Blueprint) => void;
  toggleEditMode: () => void;
  setEditMode: (isEdit: boolean) => void;
}

const STORAGE_KEY = "soupty-layout-blueprint";

const defaultBlueprint: Blueprint = {
  columns: [],
};

export const useLayoutBlueprintStore = create<
  LayoutBlueprintState & LayoutBlueprintActions
>()(
  persist(
    (set) => ({
      blueprint: defaultBlueprint,
      isEditMode: false,
      addColumn: (column) => {
        set((state) => ({
          blueprint: {
            ...state.blueprint,
            columns: [...state.blueprint.columns, { ...column }],
          },
        }));
      },
      removeColumn: (index) => {
        set((state) => ({
          blueprint: {
            ...state.blueprint,
            columns: state.blueprint.columns.filter((_, i) => i !== index),
          },
        }));
      },
      updateColumn: (index, column) => {
        set((state) => ({
          blueprint: {
            ...state.blueprint,
            columns: state.blueprint.columns.map((col, i) =>
              i === index ? column : col
            ),
          },
        }));
      },
      setBlueprint: (blueprint) => {
        set({ blueprint });
      },
      toggleEditMode: () => {
        set((state) => ({ isEditMode: !state.isEditMode }));
      },
      setEditMode: (isEdit) => {
        set({ isEditMode: isEdit });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ blueprint: state.blueprint }),
    }
  )
);

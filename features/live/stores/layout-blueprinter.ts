import { create } from "zustand";
import { Blueprint, BlueprintColumn } from "~/types/blueprint";

interface LayoutBlueprintState {
  blueprint: Blueprint;
}

interface LayoutBlueprintActions {
  addColumn: (column: BlueprintColumn) => void;
  removeColumn: (index: number) => void;
  updateColumn: (index: number, column: BlueprintColumn) => void;
  setBlueprint: (blueprint: Blueprint) => void;
}

export const useLayoutBlueprintStore = create<
  LayoutBlueprintState & LayoutBlueprintActions
>((set) => ({
  blueprint: {} as Blueprint,
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
}));

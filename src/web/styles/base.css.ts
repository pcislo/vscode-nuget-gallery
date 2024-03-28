import { css } from "@microsoft/fast-element";

export const scrollableBase = css`
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
    transition: background 2s ease;
  }

  ::-webkit-scrollbar-corner {
    background-color: transparent;
  }

  ::-webkit-scrollbar-track {
    background-color: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--vscode-scrollbarSlider-background);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--vscode-scrollbarSlider-hoverBackground);
  }

  ::-webkit-scrollbar-thumb:active {
    border-color: var(--vscode-scrollbarSlider-activeBackground);
  }
`;

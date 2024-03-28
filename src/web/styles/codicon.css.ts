import { css } from "@microsoft/fast-element";

export const base = css`
  @font-face {
    font-family: "codicon";
    font-display: block;
    src: url("assets/codicon.ttf") format("truetype");
  }

  .codicon[class*="codicon-"] {
    font: normal normal normal 16px/1 codicon;
    display: inline-block;
    text-decoration: none;
    text-rendering: auto;
    text-align: center;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  /*---------------------
 *  Modifiers
 *-------------------*/

  @keyframes codicon-spin {
    100% {
      transform: rotate(360deg);
    }
  }

  .codicon-sync.codicon-modifier-spin,
  .codicon-loading.codicon-modifier-spin,
  .codicon-gear.codicon-modifier-spin {
    /* Use steps to throttle FPS to reduce CPU usage */
    animation: codicon-spin 1.5s steps(30) infinite;
  }

  .codicon-modifier-disabled {
    opacity: 0.5;
  }

  .codicon-modifier-hidden {
    opacity: 0;
  }

  /* custom speed & easing for loading icon */
  .codicon-loading {
    animation-duration: 1s !important;
    animation-timing-function: cubic-bezier(0.53, 0.21, 0.29, 0.67) !important;
  }
`;

export const account = css`
  .codicon-account:before {
    content: "\\eb99";
  }
`;

export const search = css`
  .codicon-search:before {
    content: "\\ea6d";
  }
`;

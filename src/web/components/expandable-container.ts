import {
  FASTElement,
  attr,
  css,
  customElement,
  html,
  observable,
  when,
} from "@microsoft/fast-element";
import codicon from "@/web/styles/codicon.css";

const template = html<ExpandableContainer>`
  <div
    class="expandable ${(x) => (!x.isExpanded ? "collapsed" : "")}"
    @click=${(x) => (x.isExpanded = !x.isExpanded)}
  >
    <div class="title">
      <span
        class="codicon ${(x) => (x.isExpanded ? "codicon-chevron-down" : "codicon-chevron-right")}"
      ></span>
      <span>${(x) => x.title}</span>
    </div>
    <span class="summary">${(x) => x.summary}</span>
  </div>
  <div class="content">${when((x) => x.isExpanded, html<ExpandableContainer>`<slot></slot>`)}</div>
`;
const styles = css`
  .expandable {
    display: grid;
    grid-template-columns: fit-content(100%) auto;
    gap: 4px 20px;
    padding: 3px;
    margin: 1px;
    cursor: pointer;

    &.collapsed {
      text-wrap: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .title {
      font-weight: bold;
    }
    span {
      vertical-align: middle;
    }

    .summary {
      margin-top: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .content {
    margin: 3px;
    margin-left: 20px;
  }
`;

@customElement({
  name: "expandable-container",
  template,
  styles: [styles, codicon],
})
export class ExpandableContainer extends FASTElement {
  @attr title: string = "";
  @attr summary: string = "";
  @observable isExpanded: boolean = false;
}

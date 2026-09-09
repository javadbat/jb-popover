import CSS from "./jb-popover.css";
import VariablesCSS from "./variables.css";
import { renderHTML } from "./render.js";

let template: HTMLTemplateElement | undefined;
export function cloneTemplate() {
  template ??= document.createElement("template");
  if (!template.content.childNodes.length) template.innerHTML = `<style>${VariablesCSS} ${CSS}</style>${renderHTML()}`;
  return template.content.cloneNode(true);
}

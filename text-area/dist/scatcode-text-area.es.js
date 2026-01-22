import { jsx as x } from "react/jsx-runtime";
import { useRef as b, useEffect as g } from "react";
import { CKEditor as E } from "@ckeditor/ckeditor5-react";
import { Essentials as T, Paragraph as C, FontFamily as S, ClassicEditor as L, Plugin as h, ButtonView as v } from "ckeditor5";
import { registerCopyHandler as B, getHtmlFromScatcodeText as p, getScatcodeTextFromRanges as y } from "scatcode-core";
import "ckeditor5/ckeditor5.css";
const K = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="m9.239 13.938-2.88-1.663a.75.75 0 0 1 .75-1.3L9 12.067V4.75a.75.75 0 1 1 1.5 0v7.318l1.89-1.093a.75.75 0 0 1 .75 1.3l-2.879 1.663a.75.75 0 0 1-.511.187.75.75 0 0 1-.511-.187M4.25 17a.75.75 0 1 1 0-1.5h10.5a.75.75 0 0 1 0 1.5z"/></svg>', k = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M6.146 11.22a.75.75 0 0 1 1.061 0l3.677 3.678a.75.75 0 0 1-1.06 1.06l-2.397-2.396v5.689a.75.75 0 0 1-1.5 0v-5.69L3.53 15.959a.75.75 0 0 1-1.06-1.06z"/><path fill-rule="evenodd" d="M17.75 5.94v11.61a.95.95 0 0 1-.95.951h-6.3a.75.75 0 0 1 0-1.5h5.75v-10H11.7a.95.95 0 0 1-.95-.95V1.5h-6v8.66l-1.5 1.5V.95A.95.95 0 0 1 4.2 0h7.61zm-5.5-.439h2.94l-2.94-2.94z" clip-rule="evenodd"/></svg>';
class F extends h {
  init() {
    const i = this.editor;
    i.ui.componentFactory.add("saveButton", (u) => {
      const n = new v(u);
      return n.set({
        icon: K,
        label: "Save",
        withText: !1,
        tooltip: !0
      }), n.on("execute", () => {
        const e = i.ui.view.editable.element;
        if (!e) {
          console.error("Could not find editable element");
          return;
        }
        const c = document.createRange();
        c.selectNodeContents(e);
        const o = y([c]), r = new Blob([o], { type: "text/plain;charset=utf-8" }), l = URL.createObjectURL(r), a = document.createElement("a");
        a.href = l, a.download = "scatcode-text.txt", document.body.appendChild(a), a.click(), document.body.removeChild(a), URL.revokeObjectURL(l), console.log("Saved Scatcode text:", o);
      }), n;
    });
  }
}
class R extends h {
  init() {
    const i = this.editor;
    i.ui.componentFactory.add("loadButton", (u) => {
      const n = new v(u);
      return n.set({
        icon: k,
        label: "Load",
        withText: !1,
        tooltip: !0
      }), n.on("execute", () => {
        const e = document.createElement("input");
        e.type = "file", e.accept = ".txt,text/plain", e.onchange = async (c) => {
          const o = c.target.files[0];
          if (o)
            try {
              const r = await o.text();
              console.log("Loaded Scatcode text:", r);
              const l = p(r);
              console.log("Parsed HTML:", l), i.setData(l), console.log("Successfully loaded file into editor");
            } catch (r) {
              console.error("Error loading file:", r), alert("Error loading file: " + r.message);
            }
        }, e.click();
      }), n;
    });
  }
}
function z({ value: m, editableElementRef: i, onChange: u }) {
  const n = b(null);
  return g(() => {
    B();
  }, []), g(() => {
    if (!n.current) return;
    const e = p(m);
    n.current.setData(e);
  }, [m]), /* @__PURE__ */ x(
    E,
    {
      editor: L,
      onChange: (e, c) => {
        if (u)
          try {
            const o = c.ui.view.editable.element;
            if (o) {
              const r = document.createRange();
              r.selectNodeContents(o);
              const l = y([r]);
              u(l);
            }
          } catch (o) {
            console.error("Error in onChange handler:", o);
          }
      },
      onReady: (e) => {
        n.current = e, i && (i.current = e.ui.view.editable.element);
        const c = e.plugins.get("ClipboardPipeline");
        if (!c) {
          console.error("Clipboard plugin not found in CKEditor instance");
          return;
        }
        const o = (a, s) => {
          try {
            console.log("CKEditor clipboard inputTransformation event", s);
            const t = s.dataTransfer;
            if (!t) return;
            e.model.change((w) => w.removeSelectionAttribute("fontFamily"));
            const d = t.getData("text/plain") ?? "", f = p(d);
            console.log("Parsed HTML from Scatcode:", f), s.content = e.data.processor.toView(f);
          } catch (t) {
            console.error("Error handling clipboard inputTransformation:", t);
          }
        };
        c.on("inputTransformation", o), e.on("destroy", () => {
          c.off("inputTransformation", o), n.current = null;
        });
        try {
          e.keystrokes.set("Enter", (a, s) => {
            const t = a.domEvent;
            if (!(t.ctrlKey || t.metaKey || t.altKey) && !t.shiftKey) {
              if (e.commands.get("shiftEnter"))
                try {
                  e.execute("shiftEnter");
                } catch {
                }
              s();
            }
          });
        } catch (a) {
          console.warn("Could not override Enter keystroke to insert <br/>:", a);
        }
        e.editing.view.document.on("keydown", (a, s) => {
          try {
            const t = s.domEvent;
            if (t.ctrlKey || t.metaKey || t.altKey) return;
            const d = t.key;
            (d && d.length === 1 || d === "Enter" || d === "Tab") && e.model.change((f) => f.removeSelectionAttribute("fontFamily"));
          } catch (t) {
            console.error("Error enforcing default font on typing:", t);
          }
        }, { priority: "high" });
        let l = p(m);
        e.setData(l);
      },
      config: {
        licenseKey: "GPL",
        plugins: [T, C, S, F, R],
        fontFamily: {
          supportAllValues: !0
        },
        toolbar: {
          items: [
            "loadButton",
            "saveButton"
          ]
        }
      }
    }
  );
}
export {
  z as ScatcodeTextArea
};

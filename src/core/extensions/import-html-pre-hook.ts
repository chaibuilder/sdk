let PRE_IMPORT_HTML_HOOK = (code: string) => code;

const registerChaiPreImportHTMLHook = (fn: (code: string) => string) => {
  PRE_IMPORT_HTML_HOOK = fn;
};

export const getPreImportHTML = (code: string) => PRE_IMPORT_HTML_HOOK(code);

export { registerChaiPreImportHTMLHook };

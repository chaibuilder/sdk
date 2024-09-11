import { registerChaiBlock } from "@chaibuilder/runtime";

import { Component as Box, Config as BoxConfig } from "./box";
import { Component as Button, Config as ButtonConfig } from "./button";
import { Component as CustomHTML, Config as CustomHTMLConfig } from "./custom-html";
// import "./empty-box";
// import "./heading";
// import "./paragraph";
// import "./span";
// import "./rte";
//
// import "./link";
// import "./lightbox-link";
// import "./list";
// import "./icon";
// import "./image";
// import "./slot";
// import "./video";
// import "./custom-script";
// import "./divider";
// import "./text";
// import "./dark-mode";
//
// // hidden
// import "./hidden/body";
// import "./hidden/line-break";
// import "./hidden/table";
// import "./hidden/form/form";
// import "./hidden/form/form-button";
// import "./hidden/form/checkbox";
// import "./hidden/form/input";
// import "./hidden/form/radio";
// import "./hidden/form/select";
// import "./hidden/form/textarea";

const loadWebBlocks = () => {
  registerChaiBlock(Box, BoxConfig);
  registerChaiBlock(Button, ButtonConfig);
  registerChaiBlock(CustomHTML, CustomHTMLConfig);
};

export { loadWebBlocks };

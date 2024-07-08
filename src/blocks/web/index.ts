import { noop } from "lodash-es";
import "./box";
import "./heading";
import "./paragraph";
import "./span";
import "./rte";
import "./button";
import "./link";
import "./list";
import "./icon";
import "./image";
import "./slot";
import "./video";
import "./custom-html";
import "./divider";
import "./text";

import "./interactive/accordion.tsx";
import "./interactive/collapse.tsx";
// import "./interactive/dark-mode.tsx";
// hidden
import "./hidden/body";
import "./hidden/line-break";
import "./hidden/table";
import "./hidden/form/form";
import "./hidden/form/form-button";
import "./hidden/form/checkbox";
import "./hidden/form/input";
import "./hidden/form/radio";
import "./hidden/form/select";
import "./hidden/form/textarea";

const loadWebBlocks = noop;

export { loadWebBlocks };

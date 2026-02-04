import { registerChaiBlock } from "@chaibuilder/sdk/runtime";
import dynamic from "next/dynamic";
import { FormConfig } from "./form-block";

const ChaiForm = dynamic(() => import("./form-block"));

export const registerBlocks = () => {
  registerChaiBlock(ChaiForm, FormConfig);
};

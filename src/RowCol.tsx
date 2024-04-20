import { registerChaiBlock } from "@chaibuilder/runtime";

const ColComponent = () => {
  return <div>Column</div>;
};

const RowComponent = () => {
  return <div className={"w-full p-4 border"}>Row</div>;
};

registerChaiBlock(ColComponent, {
  type: "Col",
  label: "Col",
  category: "core",
  group: "basic",
  props: {},
});

registerChaiBlock(RowComponent, {
  type: "Row",
  label: "Row",
  category: "core",
  group: "basic",
  props: {},
});

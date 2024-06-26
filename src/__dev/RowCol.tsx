import { registerChaiBlock } from "@chaibuilder/runtime";

const ColComponent = () => {
  return <div>Column</div>;
};

const RowComponent = () => {
  return <div className={"w-full border p-4"}>Row</div>;
};

registerChaiBlock(ColComponent, {
  type: "Col",
  label: "Col",
  category: "core",
  group: "basic",
});

registerChaiBlock(RowComponent, {
  type: "Row",
  label: "Row",
  category: "core",
  group: "basic",
});

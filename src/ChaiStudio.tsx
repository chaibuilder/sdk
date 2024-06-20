import { ChaiBuilderStudio } from "./studio";
import React from "react";
import "./data-providers/data";
import "./blocks/web";

const Logo: React.FC<any> = () => <h2 className="font-bold text-gray-500">Chai Builder</h2>;

function ChaiStudio() {
  return <ChaiBuilderStudio dataBindingSupport={true} logo={Logo} />;
}

export default ChaiStudio;

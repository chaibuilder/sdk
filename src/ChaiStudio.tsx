import { ChaiBuilderStudio } from "./studio";
import React from "react";
import "./data-providers/data";
import "./blocks/web";
import "./data-providers/data";

const Logo: React.FC<any> = () => <h2 className="font-bold text-gray-500">Chai Builder</h2>;

function ChaiStudio() {
  return <ChaiBuilderStudio logo={Logo} />;
}

export default ChaiStudio;

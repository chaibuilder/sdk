import { ChaiBuilderStudio } from "./studio";
import React from "react";

const Logo: React.FC<any> = () => <h2 className="font-bold text-gray-500">Chai Builder</h2>;

function ChaiStudio() {
  return <ChaiBuilderStudio logo={Logo} />;
}

export default ChaiStudio;

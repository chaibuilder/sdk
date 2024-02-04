import { ChaiBuilderStudio } from "./studio";
import React from "react";
import "./blocks";
import "./data-providers/data.ts";

const Logo: React.FC<any> = () => <h2 className="font-bold text-gray-500">Chai Builder</h2>;

function App() {
  return <ChaiBuilderStudio logo={Logo} />;
}

export default App;

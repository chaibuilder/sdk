"use client";

import "@chaibuilder/sdk/styles";
import dynamic from "next/dynamic";
const ChaiBuilderEditor = dynamic(() => import("@chaibuilder/sdk/pages").then((mod) => mod.default), {
  ssr: false,
});

export default function Home() {
  return <ChaiBuilderEditor />;
}

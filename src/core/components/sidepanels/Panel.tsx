import React from "react";

type TPanelProps = {
  children: React.ReactNode;
  heading: React.ReactNode;
};

export const Panel = ({ heading, children }: TPanelProps) => (
  <div className="relative h-full">
    <div className="rounded-md bg-background/30 p-1">{heading}</div>
    <div className="px-1">{children}</div>
  </div>
);

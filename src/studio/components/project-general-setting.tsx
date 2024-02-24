import * as React from "react";
import { ScrollArea } from "../../ui";
import { Image, SingleLineText } from "@chaibuilder/runtime/controls";
import { Form } from "./form";
import { useProject } from "../hooks/useProject";

const ProjectGeneralSetting = ({
  _projectData,
  seany,
}: {
  _projectData: any;
  seany: (pd: any) => any;
}): React.ReactElement => {
  const { data: projectData, isLoading } = useProject();

  React.useEffect(() => {
    if (projectData) seany(projectData);
  }, [projectData, seany]);

  const updateProjectRealtime = ({ formData }: any, key?: string) => {
    seany((currentData: any) => ({
      ...currentData,
      [key as string]: formData[key as string],
    }));
  };

  const properties = {
    name: SingleLineText({
      title: "Project Name",
      default: projectData?.name,
    }),
    favicon: Image({ title: "Favicon", default: projectData?.favicon }),
  };

  return (
    <ScrollArea className="flex h-full select-none flex-col">
      <Form properties={properties} disabled={isLoading} formData={_projectData} onChange={updateProjectRealtime} />
    </ScrollArea>
  );
};

export default ProjectGeneralSetting;

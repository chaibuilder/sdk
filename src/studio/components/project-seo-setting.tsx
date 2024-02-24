import * as React from "react";
import { Image, Model, MultilineText, SingleLineText } from "@chaibuilder/runtime/controls";
import { Form } from "./form";

const ProjectSeoSettings = ({
  _projectData,
  seany,
}: {
  _projectData: any;
  seany: (pd: any) => any;
}): React.ReactElement => {
  const updateRealtime = ({ formData }: any) => {
    const _formData: any = { ...formData };
    if (_formData.seoData.title === undefined) _formData.seoData.title = "";
    if (_formData.seoData.description === undefined) _formData.seoData.description = "";
    if (_formData.seoData.image === undefined) _formData.seoData.image = "";
    seany((currentData: any) => ({
      ...currentData,
      ..._formData,
    }));
  };

  const properties = {
    seoData: Model({
      title: "",
      default: {
        title: (_projectData.seoData?.title || "") as string,
        description: (_projectData.seoData?.description || "") as string,
        image: (_projectData.seoData?.image || "") as string,
      },
      properties: {
        title: SingleLineText({
          title: "Default Title",
          default: (_projectData.seoData?.title || "") as string,
        }),
        description: MultilineText({
          title: "Default Description",
          default: (_projectData.seoData?.description || "") as string,
        }),
        image: Image({
          title: "Social Media Image",
          default: (_projectData.seoData?.image || "") as string,
        }),
      },
    }),
  };

  return (
    <div className="flex h-full select-none flex-col">
      <Form properties={properties} formData={_projectData} onChange={updateRealtime} />
    </div>
  );
};

export default ProjectSeoSettings;

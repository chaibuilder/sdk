export const getQueries = (mq: string) => {
  let str: Array<string> = [];
  switch (mq) {
    case "xs":
      str = ["xs"];
      break;
    case "sm":
      str = ["xs", "sm"];
      break;
    case "md":
      str = ["xs", "sm", "md"];
      break;
    case "lg":
      str = ["xs", "sm", "md", "lg"];
      break;
    case "xl":
      str = ["xs", "sm", "md", "lg", "xl"];
      break;
    case "2xl":
      str = ["xs", "sm", "md", "lg", "xl", "2xl"];
      break;
    default:
      str = ["xs"];
      break;
  }
  return str;
};

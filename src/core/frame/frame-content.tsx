// @ts-nocheck
import { Children, Component } from "react"; // eslint-disable-line no-unused-vars

interface ContentProps {
  children: React.ReactElement;
  contentDidMount(...args: unknown[]): unknown;
  contentDidUpdate(...args: unknown[]): unknown;
}

export default class Content extends Component<ContentProps> {
  componentDidMount() {
    this.props.contentDidMount();
  }

  componentDidUpdate() {
    this.props.contentDidUpdate();
  }

  render() {
    return Children.only(this.props.children);
  }
}

// @ts-nocheck
import Content from "@/core/frame/frame-content";
import { FrameContextProvider } from "@/core/frame/frame-context";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { toast } from "sonner";

interface FrameProps {
  style?: object;
  head?: React.ReactNode; // eslint-disable-line;
  initialContent?: string;
  mountTarget?: string;
  className?: string;
  contentDidMount?(...args: unknown[]): unknown;
  contentDidUpdate?(...args: unknown[]): unknown;
  children?: React.ReactElement | React.ReactElement[];
}

export class Frame extends Component<FrameProps> {
  static defaultProps = {
    style: {},
    head: null,
    children: undefined,
    mountTarget: undefined,
    contentDidMount: () => {},
    contentDidUpdate: () => {},
    initialContent: '<!DOCTYPE html><html><head></head><body><div class="frame-root"></div></body></html>',
  };

  constructor(props, context) {
    super(props, context);
    this._isMounted = false;
    this.nodeRef = React.createRef();
    this.state = { iframeLoaded: false };
    this.linkClickHandler = null;
  }

  componentDidMount() {
    this._isMounted = true;

    const doc = this.getDoc();

    if (doc) {
      this.nodeRef.current.contentWindow.addEventListener("DOMContentLoaded", this.handleLoad);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;

    this.nodeRef.current?.removeEventListener("DOMContentLoaded", this.handleLoad);
    this.removeLinkInterception();
  }

  getDoc() {
    return this.nodeRef.current ? this.nodeRef.current.contentDocument : null; // eslint-disable-line
  }

  getMountTarget() {
    const doc = this.getDoc();
    if (this.props.mountTarget) {
      return doc.querySelector(this.props.mountTarget);
    }
    return doc.body.children[0];
  }

  reloadSrcDoc = () => {
    if (this.nodeRef.current && this.props.initialContent) {
      // Force reload by setting srcDoc again
      this.nodeRef.current.srcdoc = this.props.initialContent;
      // Re-establish link interception after reload
      setTimeout(() => {
        this.setupLinkInterception();
      }, 100);
    }
  };

  scrollToElement = (elementId) => {
    if (this.nodeRef.current && this.nodeRef.current.contentDocument) {
      const doc = this.nodeRef.current.contentDocument;
      const element = doc.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      } else {
        return false;
      }
    }
    return false;
  };

  isSameDomain = (url1, url2) => {
    try {
      const domain1 = new URL(url1).origin;
      const domain2 = new URL(url2).origin;
      return domain1 === domain2;
    } catch (error) {
      return false;
    }
  };

  isExternalLink = (href) => {
    try {
      const url = new URL(href, window.location.href);
      const currentOrigin = window.location.origin;
      return url.origin !== currentOrigin;
    } catch (error) {
      // If URL parsing fails, treat as internal/relative
      return false;
    }
  };

  isFragmentLink = (href) => {
    return href && href.startsWith("#");
  };

  handleLinkClick = (event) => {
    const target = event.target.closest("a");
    if (!target || !target.href) return;

    const href = target.getAttribute("href");
    const targetAttr = target.getAttribute("target") || "_self";

    // Handle fragment links (e.g., #section)
    if (this.isFragmentLink(href)) {
      event.preventDefault();
      const elementId = href.substring(1);
      const scrolled = this.scrollToElement(elementId);
      return;
    }

    // Check if it's an external link
    if (this.isExternalLink(href)) {
      if (targetAttr === "_blank") {
        // Allow external links with target="_blank"
        return;
      } else {
        // Block external links with target="_self"
        event.preventDefault();
        toast.error("External link blocked", {
          description: "External links can only be opened in live mode.",
          position: "top-right",
        });
        return;
      }
    }

    // Internal/same-domain link
    event.preventDefault();

    // Check if it has a fragment
    try {
      const url = new URL(href, window.location.href);
      if (url.hash) {
        const elementId = url.hash.substring(1);
        this.scrollToElement(elementId);
      } else {
        // For other internal links, you can implement custom navigation logic here
        toast.info("Internal link", {
          description: "Internal page navigation is handled live mode.",
          position: "top-right",
        });
      }
    } catch (error) {}
  };

  setupLinkInterception = () => {
    const doc = this.getDoc();
    if (!doc) return;

    // Remove previous listener if exists
    this.removeLinkInterception();

    // Add click event listener to intercept all link clicks
    this.linkClickHandler = this.handleLinkClick.bind(this);
    doc.addEventListener("click", this.linkClickHandler, true);
  };

  removeLinkInterception = () => {
    const doc = this.getDoc();
    if (doc && this.linkClickHandler) {
      doc.removeEventListener("click", this.linkClickHandler, true);
      this.linkClickHandler = null;
    }
  };

  setRef = (node) => {
    this.nodeRef.current = node;

    const { forwardedRef } = this.props; // eslint-disable-line react/prop-types
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  handleLoad = () => {
    clearInterval(this.loadCheck);

    // Block any content that is not srcDoc
    if (this.nodeRef.current && this.nodeRef.current.contentWindow) {
      try {
        const loadedUrl = this.nodeRef.current.contentWindow.location.href;

        if (loadedUrl.includes(":srcdoc")) {
          // * Allowing srcDoc content
        } else if (this.props.initialContent) {
          // Check if it's a same-domain URL with hash
          const currentDomain = window.location.origin;

          try {
            const urlObj = new URL(loadedUrl);

            // If it's same domain and has a hash, try to scroll to element
            if (this.isSameDomain(loadedUrl, currentDomain) && urlObj.hash) {
              const elementId = urlObj.hash.substring(1); // Remove # from hash

              // Reset to srcDoc and scroll to element
              this.nodeRef.current.srcdoc = this.props.initialContent;
              this.setState({ iframeLoaded: false });

              // Scroll to element after a short delay to ensure content is loaded
              setTimeout(() => {
                this.scrollToElement(elementId);
                this.setupLinkInterception();
              }, 500);

              return;
            }
          } catch {}

          // Block all other external URLs
          toast.error("External navigation blocked", {
            description: "External links must be opened in a new tab for security.",
          });
          this.setState({ iframeLoaded: false });
          this.nodeRef.current.srcdoc = this.props.initialContent;
          // Re-establish link interception after reload
          setTimeout(() => {
            this.setupLinkInterception();
          }, 500);
          return;
        }
      } catch {
        // Handle cross-origin access errors
      }
    }

    // Bail update as some browsers will trigger on both DOMContentLoaded & onLoad ala firefox
    if (!this.state.iframeLoaded) {
      this.setState({ iframeLoaded: true }, () => {
        // Set up link interception after iframe is fully loaded
        this.setupLinkInterception();
      });
    }
  };

  // In certain situations on a cold cache DOMContentLoaded never gets called
  // fallback to an interval to check if that's the case
  loadCheck = () =>
    setInterval(() => {
      this.handleLoad();
    }, 500);

  renderFrameContents() {
    if (!this._isMounted) {
      return null;
    }

    const doc = this.getDoc();

    if (!doc) {
      return null;
    }

    const contentDidMount = this.props.contentDidMount;
    const contentDidUpdate = this.props.contentDidUpdate;

    const win = doc.defaultView || doc.parentView;
    const contents = (
      <Content contentDidMount={contentDidMount} contentDidUpdate={contentDidUpdate}>
        <FrameContextProvider value={{ document: doc, window: win }}>
          <div className="frame-content">{this.props.children}</div>
        </FrameContextProvider>
      </Content>
    );

    const mountTarget = this.getMountTarget();

    return [ReactDOM.createPortal(this.props.head, this.getDoc().head), ReactDOM.createPortal(contents, mountTarget)];
  }

  render() {
    const props = {
      ...this.props,
      srcDoc: this.props.initialContent,
      children: undefined, // The iframe isn't ready so we drop children from props here. #12, #17
    };
    delete props.head;
    delete props.initialContent;
    delete props.mountTarget;
    delete props.contentDidMount;
    delete props.contentDidUpdate;
    delete props.forwardedRef;

    // Ensure iframe only uses srcDoc, remove src prop if present
    delete props.src;

    return (
      <iframe {...props} ref={this.setRef} onLoad={this.handleLoad}>
        {this.state.iframeLoaded && this.renderFrameContents()}
      </iframe>
    );
  }
}

export const ChaiFrame = React.forwardRef((props, ref) => <Frame {...props} forwardedRef={ref} />);

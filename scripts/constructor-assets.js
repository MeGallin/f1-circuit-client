import { JSDOM } from "jsdom";

// Build/test-time only. Never inject downloaded SVG markup into the application.
export function validateConstructorSvg(source) {
  if (/<!DOCTYPE|<!ENTITY|<\?xml-stylesheet/i.test(source))
    throw new Error("Unsafe SVG declaration");
  const document = new JSDOM(source, { contentType: "image/svg+xml" }).window
    .document;
  if (
    document.documentElement.localName !== "svg" ||
    document.documentElement.namespaceURI !== "http://www.w3.org/2000/svg"
  )
    throw new Error("Not an SVG");
  for (const element of document.querySelectorAll("*")) {
    if (
      [
        "script",
        "foreignobject",
        "image",
        "iframe",
        "object",
        "embed",
        "a",
        "animate",
        "set",
        "animatetransform",
        "animatemotion",
      ].includes(element.localName.toLowerCase())
    )
      throw new Error("Active SVG content");
    for (const attribute of element.attributes) {
      const name = attribute.localName.toLowerCase();
      const value = attribute.value.trim();
      if (
        name === "base" &&
        attribute.namespaceURI === "http://www.w3.org/XML/1998/namespace"
      )
        throw new Error("SVG base URI");
      // Reviewed assets need no CSS escapes. Reject rather than partially
      // decoding escaped url()/protocol tokens in presentation/style values.
      if (!attribute.namespaceURI && value.includes("\\"))
        throw new Error("Escaped SVG attribute");
      if (name.startsWith("on")) throw new Error("SVG event handler");
      if ((name === "href" || name === "src") && !value.startsWith("#"))
        throw new Error("External SVG reference");
      for (const match of value.matchAll(
        /url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/gi,
      )) {
        if (!match[1].startsWith("#")) throw new Error("External SVG URL");
      }
    }
    if (element.localName === "style")
      throw new Error("Embedded SVG stylesheet");
  }
  return true;
}

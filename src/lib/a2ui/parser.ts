/**
 * A2UI Message Parser
 * Parses LLM responses to extract A2UI components
 */

import type { A2UIComponent, A2UIMessage, A2UISurfaceUpdate } from "./types";

/**
 * Extract balanced JSON objects from a string
 */
function extractJsonObjects(content: string): { json: string; start: number; end: number }[] {
  const results: { json: string; start: number; end: number }[] = [];
  let i = 0;

  while (i < content.length) {
    if (content[i] === "{") {
      let depth = 0;
      let start = i;
      let inString = false;
      let escaped = false;

      for (let j = i; j < content.length; j++) {
        const char = content[j];

        if (escaped) {
          escaped = false;
          continue;
        }

        if (char === "\\") {
          escaped = true;
          continue;
        }

        if (char === '"' && !escaped) {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === "{") depth++;
          if (char === "}") {
            depth--;
            if (depth === 0) {
              const jsonStr = content.slice(start, j + 1);
              // Check if it's a surfaceUpdate or component
              if (jsonStr.includes('"surfaceUpdate"') || jsonStr.includes('"component"')) {
                results.push({ json: jsonStr, start, end: j + 1 });
              }
              i = j;
              break;
            }
          }
        }
      }
    }
    i++;
  }

  return results;
}

/**
 * Parse a message to extract A2UI components
 */
export function parseA2UIMessage(content: string): A2UIMessage {
  const components: A2UIComponent[] = [];
  let textContent = content;

  // Extract JSON objects from the content
  const jsonObjects = extractJsonObjects(content);

  for (const { json, start, end } of jsonObjects) {
    try {
      const parsed = JSON.parse(json);

      if (isSurfaceUpdate(parsed)) {
        components.push({
          component: parsed.surfaceUpdate.component,
          props: parsed.surfaceUpdate.props,
        });
        // Mark for removal (we'll do it in order)
        textContent = textContent.replace(json, "");
      } else if (isA2UIComponent(parsed)) {
        components.push(parsed);
        textContent = textContent.replace(json, "");
      }
    } catch {
      // Not valid JSON, keep as text
    }
  }

  // Clean up extra whitespace
  textContent = textContent.replace(/\s+/g, " ").trim();

  return {
    text: textContent || undefined,
    components: components.length > 0 ? components : undefined,
  };
}

function isSurfaceUpdate(obj: unknown): obj is A2UISurfaceUpdate {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "surfaceUpdate" in obj &&
    typeof (obj as A2UISurfaceUpdate).surfaceUpdate === "object" &&
    typeof (obj as A2UISurfaceUpdate).surfaceUpdate.component === "string"
  );
}

function isA2UIComponent(obj: unknown): obj is A2UIComponent {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "component" in obj &&
    typeof (obj as A2UIComponent).component === "string"
  );
}

/**
 * Check if a message contains valid A2UI content
 */
export function hasA2UIContent(content: string): boolean {
  const message = parseA2UIMessage(content);
  return message.components !== undefined && message.components.length > 0;
}

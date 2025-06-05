import { Element } from "../types";

export const getElementAtPosition = (
  x: number,
  y: number,
  elements: Element[]
): Element | null => {
  // Search in reverse order to find the topmost element first
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];

    if (element.type === "pencil") {
      // For pencil, check if the point is close to any of the pencil's points
      const { points } = element;
      if (!points) continue;

      for (let j = 0; j < points.length - 1; j++) {
        const [x1, y1] = points[j];
        const [x2, y2] = points[j + 1];

        // Calculate distance from point to line segment
        const distance = distancePointToLineSegment(x, y, x1, y1, x2, y2);

        if (distance < 5) {
          // 5px threshold
          return element;
        }
      }
    } else {
      // For other shapes, check if the point is inside the bounding box
      const { x: elementX, y: elementY, width, height } = element;

      // Transform coordinates based on element's angle
      const angle = element.angle || 0;
      const centerX = elementX + width / 2;
      const centerY = elementY + height / 2;

      // Translate point to origin
      const translatedX = x - centerX;
      const translatedY = y - centerY;

      // Rotate point
      const rotatedX =
        translatedX * Math.cos(-angle) - translatedY * Math.sin(-angle);
      const rotatedY =
        translatedX * Math.sin(-angle) + translatedY * Math.cos(-angle);

      // Translate back
      const finalX = rotatedX + centerX;
      const finalY = rotatedY + centerY;

      if (
        finalX >= elementX &&
        finalX <= elementX + width &&
        finalY >= elementY &&
        finalY <= elementY + height
      ) {
        return element;
      }
    }
  }

  return null;
};

export const getNewElementPosition = (
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  type: string
) => {
  let width = currentX - startX;
  let height = currentY - startY;

  if (type === "ellipse") {
    // For ellipse, ensure width and height are positive
    if (width < 0) {
      startX += width;
      width = Math.abs(width);
    }
    if (height < 0) {
      startY += height;
      height = Math.abs(height);
    }
    return {
      newX: startX,
      newY: startY,
      newWidth: width,
      newHeight: height,
    };
  } else if (type === "rectangle" || type === "diamond") {
    // For rectangle and diamond, maintain aspect ratio if shift is pressed
    if ((window.event as KeyboardEvent)?.shiftKey) {
      const size = Math.max(Math.abs(width), Math.abs(height));
      width = width >= 0 ? size : -size;
      height = height >= 0 ? size : -size;
    }
    return {
      newX: Math.min(startX, startX + width),
      newY: Math.min(startY, startY + height),
      newWidth: Math.abs(width),
      newHeight: Math.abs(height),
    };
  } else if (type === "arrow" || type === "line") {
    // For arrow and line, allow negative width/height, and always use startX/startY as origin
    return {
      newX: startX,
      newY: startY,
      newWidth: width,
      newHeight: height,
    };
  }

  // Default fallback
  return {
    newX: Math.min(startX, startX + width),
    newY: Math.min(startY, startY + height),
    newWidth: Math.abs(width),
    newHeight: Math.abs(height),
  };
};

// Calculate the distance from a point to a line segment
const distancePointToLineSegment = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;

  return Math.sqrt(dx * dx + dy * dy);
};

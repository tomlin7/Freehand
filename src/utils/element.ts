import rough, { RoughGenerator } from "roughjs/bin/rough";
import { nanoid } from "nanoid";
import { Element } from "../types";
import { getStroke } from "perfect-freehand";

export const createElement = (
  props: Partial<Element> & { id: string; type: string }
): Element => {
  return {
    x: props.x || 0,
    y: props.y || 0,
    width: props.width || 0,
    height: props.height || 0,
    strokeColor: props.strokeColor || "#000000",
    fillColor: props.fillColor || "transparent",
    strokeWidth: props.strokeWidth || 2,
    roughness: props.roughness || 1,
    opacity: props.opacity || 1,
    fillStyle: props.fillStyle || "none",
    angle: props.angle || 0,
    points: props.points || [],
    ...props,
  };
};

export const updateElement = (
  elements: Element[],
  elementId: string,
  x: number,
  y: number,
  width: number,
  height: number
): Element[] => {
  return elements.map((element) => {
    if (element.id === elementId) {
      return {
        ...element,
        x,
        y,
        width,
        height,
      };
    }
    return element;
  });
};

export const drawElement = (
  context: CanvasRenderingContext2D,
  element: Element,
  generator: RoughGenerator
) => {
  context.save();
  context.globalAlpha = element.opacity || 1;

  switch (element.type) {
    case "rectangle":
      drawRectangle(context, element, generator);
      break;
    case "ellipse":
      drawEllipse(context, element, generator);
      break;
    case "diamond":
      drawDiamond(context, element, generator);
      break;
    case "line":
      drawLine(context, element, generator);
      break;
    case "arrow":
      drawArrow(context, element, generator);
      break;
    case "pencil":
      drawPencil(context, element);
      break;
    case "text":
      drawText(context, element, generator);
      break;
    case "image":
      drawImage(context, element);
      break;
    default:
      break;
  }

  context.restore();
};

const drawRectangle = (
  context: CanvasRenderingContext2D,
  element: Element,
  generator: RoughGenerator
) => {
  const {
    x,
    y,
    width,
    height,
    strokeColor,
    fillColor,
    strokeWidth,
    roughness,
    fillStyle,
    angle = 0,
  } = element;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  context.save();
  context.translate(centerX, centerY);
  context.rotate(angle);
  context.translate(-centerX, -centerY);

  const roughElement = generator.rectangle(x, y, width, height, {
    stroke: strokeColor,
    strokeWidth,
    fillStyle: fillStyle === "none" ? "none" : fillStyle,
    fill: fillStyle === "none" ? undefined : fillColor || undefined,
    roughness,
    seed: element.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0),
  });

  context.strokeStyle = strokeColor;
  context.lineWidth = strokeWidth;
  roughElement.sets.forEach((set: any) => {
    context.beginPath();
    set.ops.forEach((op: any) => {
      const data = op.data;
      switch (op.op) {
        case "move":
          context.moveTo(data[0], data[1]);
          break;
        case "lineTo":
          context.lineTo(data[0], data[1]);
          break;
        case "bcurveTo":
          context.bezierCurveTo(
            data[0],
            data[1],
            data[2],
            data[3],
            data[4],
            data[5]
          );
          break;
        default:
          break;
      }
    });
    if (set.type === "path") {
      context.stroke();
    } else {
      context.fillStyle = fillColor || "#000";
      context.fill();
    }
  });
  context.restore();
};

const drawEllipse = (
  context: CanvasRenderingContext2D,
  element: Element,
  generator: RoughGenerator
) => {
  const {
    x,
    y,
    width,
    height,
    strokeColor,
    fillColor,
    strokeWidth,
    roughness,
    fillStyle,
    angle = 0,
  } = element;
  const ellipseX = x + width / 2;
  const ellipseY = y + height / 2;
  context.save();
  context.translate(ellipseX, ellipseY);
  context.rotate(angle);
  context.translate(-ellipseX, -ellipseY);

  const roughElement = generator.ellipse(ellipseX, ellipseY, width, height, {
    stroke: strokeColor,
    strokeWidth,
    fillStyle: fillStyle === "none" ? "none" : fillStyle,
    fill: fillStyle === "none" ? undefined : fillColor || undefined,
    roughness,
    seed: element.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0),
  });

  context.strokeStyle = strokeColor;
  context.lineWidth = strokeWidth;
  roughElement.sets.forEach((set: any) => {
    context.beginPath();
    set.ops.forEach((op: any) => {
      const data = op.data;
      switch (op.op) {
        case "move":
          context.moveTo(data[0], data[1]);
          break;
        case "lineTo":
          context.lineTo(data[0], data[1]);
          break;
        case "bcurveTo":
          context.bezierCurveTo(
            data[0],
            data[1],
            data[2],
            data[3],
            data[4],
            data[5]
          );
          break;
        default:
          break;
      }
    });
    if (set.type === "path") {
      context.stroke();
    } else {
      context.fillStyle = fillColor || "#000";
      context.fill();
    }
  });
  context.restore();
};

const drawDiamond = (
  context: CanvasRenderingContext2D,
  element: Element,
  generator: RoughGenerator
) => {
  const {
    x,
    y,
    width,
    height,
    strokeColor,
    fillColor,
    strokeWidth,
    roughness,
    fillStyle,
    angle = 0,
  } = element;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  context.save();
  context.translate(centerX, centerY);
  context.rotate(angle);
  context.translate(-centerX, -centerY);

  const points = [
    [centerX, y],
    [x + width, centerY],
    [centerX, y + height],
    [x, centerY],
  ];
  const roughElement = generator.polygon(points, {
    stroke: strokeColor,
    strokeWidth,
    fillStyle: fillStyle === "none" ? "none" : fillStyle,
    fill: fillStyle === "none" ? undefined : fillColor || undefined,
    roughness,
    seed: element.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0),
  });

  context.strokeStyle = strokeColor;
  context.lineWidth = strokeWidth;
  roughElement.sets.forEach((set: any) => {
    context.beginPath();
    set.ops.forEach((op: any) => {
      const data = op.data;
      switch (op.op) {
        case "move":
          context.moveTo(data[0], data[1]);
          break;
        case "lineTo":
          context.lineTo(data[0], data[1]);
          break;
        case "bcurveTo":
          context.bezierCurveTo(
            data[0],
            data[1],
            data[2],
            data[3],
            data[4],
            data[5]
          );
          break;
        default:
          break;
      }
    });
    if (set.type === "path") {
      context.stroke();
    } else {
      context.fillStyle = fillColor || "#000";
      context.fill();
    }
  });
  context.restore();
};

const drawLine = (
  context: CanvasRenderingContext2D,
  element: Element,
  generator: RoughGenerator
) => {
  const {
    x,
    y,
    width,
    height,
    strokeColor,
    strokeWidth,
    roughness,
    angle = 0,
  } = element;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  context.save();
  context.translate(centerX, centerY);
  context.rotate(angle);
  context.translate(-centerX, -centerY);

  const roughElement = generator.line(x, y, x + width, y + height, {
    stroke: strokeColor,
    strokeWidth,
    roughness,
    seed: element.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0),
  });

  context.strokeStyle = strokeColor;
  context.lineWidth = strokeWidth;
  roughElement.sets.forEach((set: any) => {
    context.beginPath();
    set.ops.forEach((op: any) => {
      const data = op.data;
      switch (op.op) {
        case "move":
          context.moveTo(data[0], data[1]);
          break;
        case "lineTo":
          context.lineTo(data[0], data[1]);
          break;
        case "bcurveTo":
          context.bezierCurveTo(
            data[0],
            data[1],
            data[2],
            data[3],
            data[4],
            data[5]
          );
          break;
        default:
          break;
      }
    });
    context.stroke();
  });
  context.restore();
};

const drawArrow = (
  context: CanvasRenderingContext2D,
  element: Element,
  generator: RoughGenerator
) => {
  const {
    x,
    y,
    width,
    height,
    strokeColor,
    strokeWidth,
    roughness,
    angle = 0,
  } = element;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  context.save();
  context.translate(centerX, centerY);
  context.rotate(angle);
  context.translate(-centerX, -centerY);

  // Draw the line part
  const roughLine = generator.line(x, y, x + width, y + height, {
    stroke: strokeColor,
    strokeWidth,
    roughness,
    seed: element.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0),
  });

  context.strokeStyle = strokeColor;
  context.lineWidth = strokeWidth;
  roughLine.sets.forEach((set: any) => {
    context.beginPath();
    set.ops.forEach((op: any) => {
      const data = op.data;
      switch (op.op) {
        case "move":
          context.moveTo(data[0], data[1]);
          break;
        case "lineTo":
          context.lineTo(data[0], data[1]);
          break;
        case "bcurveTo":
          context.bezierCurveTo(
            data[0],
            data[1],
            data[2],
            data[3],
            data[4],
            data[5]
          );
          break;
        default:
          break;
      }
    });
    context.stroke();
  });

  // Calculate arrowhead points
  const angleLine = Math.atan2(height, width);
  const arrowLength = Math.min(
    20,
    Math.sqrt(width * width + height * height) / 2
  );
  const endX = x + width;
  const endY = y + height;
  const arrowPoint1X = endX - arrowLength * Math.cos(angleLine - Math.PI / 6);
  const arrowPoint1Y = endY - arrowLength * Math.sin(angleLine - Math.PI / 6);
  const arrowPoint2X = endX - arrowLength * Math.cos(angleLine + Math.PI / 6);
  const arrowPoint2Y = endY - arrowLength * Math.sin(angleLine + Math.PI / 6);

  // Draw arrowhead
  const roughArrow1 = generator.line(endX, endY, arrowPoint1X, arrowPoint1Y, {
    stroke: strokeColor,
    strokeWidth,
    roughness,
    seed: element.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0),
  });
  const roughArrow2 = generator.line(endX, endY, arrowPoint2X, arrowPoint2Y, {
    stroke: strokeColor,
    strokeWidth,
    roughness,
    seed: element.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0),
  });
  [roughArrow1, roughArrow2].forEach((roughArrow) => {
    roughArrow.sets.forEach((set: any) => {
      context.beginPath();
      set.ops.forEach((op: any) => {
        const data = op.data;
        switch (op.op) {
          case "move":
            context.moveTo(data[0], data[1]);
            break;
          case "lineTo":
            context.lineTo(data[0], data[1]);
            break;
          case "bcurveTo":
            context.bezierCurveTo(
              data[0],
              data[1],
              data[2],
              data[3],
              data[4],
              data[5]
            );
            break;
          default:
            break;
        }
      });
      context.stroke();
    });
  });
  context.restore();
};

const drawPencil = (context: CanvasRenderingContext2D, element: Element) => {
  const {
    points,
    strokeColor,
    strokeWidth,
    angle = 0,
    x,
    y,
    width,
    height,
  } = element;
  if (!points?.length) return;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  // Use perfect-freehand to get a smooth, natural-looking stroke
  const stroke = getStroke(points, {
    size: strokeWidth * 2,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });
  if (!stroke.length) return;
  context.save();
  context.translate(centerX, centerY);
  context.rotate(angle);
  context.translate(-centerX, -centerY);
  context.fillStyle = strokeColor;
  context.beginPath();
  const [firstPoint, ...restPoints] = stroke;
  context.moveTo(firstPoint[0], firstPoint[1]);
  restPoints.forEach((point) => {
    context.lineTo(point[0], point[1]);
  });
  context.closePath();
  context.fill();
  context.restore();
};

const drawText = (
  context: CanvasRenderingContext2D,
  element: Element,
  generator: RoughGenerator
) => {
  const {
    x,
    y,
    text,
    strokeColor,
    fontSize = 20,
    fontFamily = "sans-serif",
    textAlign = "left",
    angle = 0,
    width,
    height,
    fillColor = "#fff",
    roughness = 1,
  } = element;
  if (!text) return;
  const centerX = x + (width || 0) / 2;
  const centerY = y + (height || 0) / 2;
  context.save();
  context.translate(centerX, centerY);
  context.rotate(angle);
  context.translate(-centerX, -centerY);
  // Draw bounding rectangle for the text only if text is not empty
  if (text && width && height) {
    const roughRect = generator.rectangle(x, y, width, height, {
      stroke: strokeColor,
      strokeWidth: 1,
      fill: fillColor,
      roughness,
      seed: element.id
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0),
    });
    context.save();
    context.strokeStyle = strokeColor;
    context.lineWidth = 1;
    roughRect.sets.forEach((set: any) => {
      context.beginPath();
      set.ops.forEach((op: any) => {
        const data = op.data;
        switch (op.op) {
          case "move":
            context.moveTo(data[0], data[1]);
            break;
          case "lineTo":
            context.lineTo(data[0], data[1]);
            break;
          case "bcurveTo":
            context.bezierCurveTo(
              data[0],
              data[1],
              data[2],
              data[3],
              data[4],
              data[5]
            );
            break;
          default:
            break;
        }
      });
      context.stroke();
      if (set.type === "fillPath") {
        context.fillStyle = fillColor;
        context.fill();
      }
    });
    context.restore();
  }
  // Draw the text at the baseline (y + height * 0.8)
  context.font = `${fontSize}px ${fontFamily}`;
  context.fillStyle = strokeColor;
  context.textAlign = textAlign;
  context.fillText(text, x, y + (height ? height * 0.8 : fontSize));
  context.restore();
};

const drawImage = (context: CanvasRenderingContext2D, element: Element) => {
  const { x, y, width, height, image, angle = 0 } = element;
  if (!image) return;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  context.save();
  context.translate(centerX, centerY);
  context.rotate(angle);
  context.translate(-centerX, -centerY);
  const img = new Image();
  img.src = image;
  if (img.complete) {
    context.drawImage(img, x, y, width, height);
  } else {
    img.onload = () => {
      context.drawImage(img, x, y, width, height);
    };
  }
  context.restore();
};

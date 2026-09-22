import { useEffect, useId, useRef } from "react";
import * as echarts from "echarts/core";
import {
  BarChart,
  HeatmapChart,
  LineChart,
  ScatterChart,
} from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { APEX_SIZES } from "../../../design-system/apex.tokens";

echarts.use([
  BarChart,
  HeatmapChart,
  LineChart,
  ScatterChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export default function EChart({
  option,
  height = APEX_SIZES.chartHeight,
  label,
  description,
}) {
  const node = useRef(null);
  const chart = useRef(null);
  const descriptionId = useId();
  useEffect(() => {
    if (!node.current) return undefined;
    chart.current = echarts.init(node.current, undefined, {
      renderer: "canvas",
    });
    const resize = () => chart.current?.resize();
    const observer = new ResizeObserver(resize);
    observer.observe(node.current);
    return () => {
      observer.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    chart.current?.setOption(option, { notMerge: true });
  }, [option]);
  return (
    <>
      {description && (
        <p className="sr-only" id={descriptionId}>
          {description}
        </p>
      )}
      <div
        ref={node}
        className="analytics-chart"
        style={{ height }}
        role="img"
        aria-label={label}
        aria-describedby={description ? descriptionId : undefined}
      />
    </>
  );
}

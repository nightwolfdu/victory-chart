import { TextSize } from "victory-core";
import Axis from "./axis";
import { defaults, range } from "lodash";
import * as d3Scale from "d3-scale";
import * as d3 from "d3";

const defaultFontSize = 12;
const defaultAxisProps = {orientation: "bottom", width: 0};

const getShortestString = (domain) => {
  const domainStrs = d3.scaleLinear().domain(domain).nice().domain().map((elem) => String(elem));
  return domainStrs
    .reduce((shortest, cur) => cur.length < shortest.length ? cur : shortest, domainStrs[0]);
};

const getSize = (isVertical, sizeObj) => isVertical ? sizeObj.height : sizeObj.width;

const getTicksAndInterval = (domain, axisRange, tickCount) =>
  ({
    ticks: d3Scale.scaleLinear().domain(domain).range(axisRange).ticks(tickCount),
    tickInterval: d3.tickStep(domain[0], domain[1], tickCount)
  });

const syncTicks = (tickObject) => {
  const maxLength = Math.max.apply(null, tickObject.map((obj) => obj.ticks.length));
  return tickObject.map((obj) => {
    return range(maxLength).map((index) => obj.ticks[0] + obj.tickInterval * (index));
  });
};

const sync = (domains, labelStyle, axisProps) => {
  const props = defaults(axisProps, defaultAxisProps);
  const isVertical = Axis.isVertical(props);
  const axisRange = getSize(isVertical, props);
  const maxMinSize = Math.max.apply(null,
    domains.map((rangeDomain) =>
      getSize(isVertical,
        TextSize.approximateTextSize(
          getShortestString(rangeDomain), defaults(labelStyle, { fontSize: defaultFontSize })
        )
      )
    )
  );
  return syncTicks(
    domains.map((domain) => {
      const labelCount = Math.max(
        Math.floor(
          (getSize(isVertical, props)) /
          maxMinSize
        ),
      2);
      return getTicksAndInterval(domain, axisRange, labelCount);
    }));
};

export default sync;

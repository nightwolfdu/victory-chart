import { TextSize } from "victory-core";
import Axis from "./axis";
import { defaults, flatten, range } from "lodash";
import * as d3Scale from "d3-scale";
import * as d3 from "d3";

const defaultFontSize = 12;
const defaultAxisProps = {orientation: "bottom", width: 0};

const getLongestString = (domains) =>
  flatten(domains)
    .map((elem) => String(elem))
    .reduce((longest, cur) => cur.length > longest.length ? cur : longest, "");

const getTextSize = (longestString, labelStyle) =>
 TextSize.approximateTextSize(longestString, defaults(labelStyle, { fontSize: defaultFontSize }));

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
  return syncTicks(
    domains.map((domain) => {
      const labelCount = Math.max(
        Math.floor(
          (getSize(isVertical, props)) /
          getSize(isVertical, getTextSize(getLongestString(domain), labelStyle))
        ),
      2);
      return getTicksAndInterval(domain, axisRange, labelCount);
    }));
};

export default sync;

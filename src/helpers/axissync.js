import { TextSize } from "victory-core";
import Axis from "./axis";
import { defaults, flatten } from "lodash";
import * as d3Scale from "d3-scale";
import * as d3 from "d3";

const defaultFontSize = 12;

const getLongestString = (domains) =>
  flatten(domains)
    .map((elem) => String(elem))
    .reduce((longest, cur) => cur.length > longest.length ? cur : longest, "");


const getTextSize = (longestString, labelStyle) =>
 TextSize.approximateTextSize(longestString, defaults(labelStyle, { fontSize: defaultFontSize }));

const getSize = (isVertical, sizeObj) => isVertical ? sizeObj.height : sizeObj.width;

const getExpectedLabelCount = (longestStringSize, axisProps) => {
  const isVertical = Axis.isVertical(axisProps);
  const size = (getSize(isVertical, axisProps)) || 0;
  const textSize = getSize(isVertical, longestStringSize);
  return Math.floor(size / textSize);
};

const getTicks = (domain, tickCount) =>
  ({
    ticks: d3Scale.scaleLinear().domain(domain).range(0, 400).ticks(tickCount),
    tickInterval: d3.tickStep(domain[0], domain[1], tickCount)
  });

const syncTicks = (tickObject) => {
  const maxLength = Math.max.apply(null, tickObject.map((obj) => obj.ticks.length));
  return tickObject.map((obj) => {
    const needLength = maxLength - obj.ticks.length;
    const ticks = obj.ticks.slice(0);
    for (let index = 0; index < needLength; index++) {
      ticks.push(ticks[ticks.length - 1] + obj.tickInterval);
    }
    return {
      domain: [Math.min.apply(null, ticks), Math.max.apply(null, ticks)],
      ticks
    };
  });
};

const sync = (domains, labelStyle, axisProps) => {
  return syncTicks(domains.map((domain) => {
    const labelCount = getExpectedLabelCount(
       getTextSize(getLongestString(domain)),
       axisProps
    );
    return getTicks(domain, labelCount);
  }));
};

export default {
  sync,
  syncTicks,
  getTicks,
  getExpectedLabelCount,
  getTextSize,
  getLongestString
};

//scale types. .time(), "linear", "time", "log", "sqrt"
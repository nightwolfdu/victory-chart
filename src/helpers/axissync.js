import { TextSize } from "victory-core";
import Axis from "./axis";
import { defaults } from "lodash";
import * as d3Scale from "d3-scale";

const defaultFontSize = 12;

const getLongestString = (domains) => {
  let longestString = "";
  for (let domainsIndex = 0; domainsIndex < domains.length; domainsIndex++) {
    for (let index = 0; index < domains[domainsIndex].length; index++) {
      const element = String(domains[domainsIndex][index]);
      if (element.length > longestString.length) {
        longestString = String(element);
      }
    }
  }
  return longestString;
};

const getTextSize = (longestString, labelStyle) =>
 TextSize.approximateTextSize(longestString, defaults(labelStyle, { fontSize: defaultFontSize }));

const getExpectedLabelCount = (longestStringSize, axisProps) => {
  const isVertical = Axis.isVertical(axisProps);
  const size = (isVertical ? axisProps.height : axisProps.width) || 0;
  const textSize = isVertical ? longestStringSize.height : longestStringSize.width;
  return Math.floor(size / textSize);
};

const getTicks = (domain, tickCount) => {
  const ticks = d3Scale.scaleLinear().domain(domain).range(0, 400).ticks(tickCount);
  return ticks;
};

const syncTicks = (domainTicksArr) => {
  const maxLength = Math.max.apply(null, domainTicksArr.map((arr) => arr.length));
  return domainTicksArr.map((arr) => {
    const needLength = maxLength - arr.length;
    const ticks = arr.slice(0);
    const tickInterval = arr[1] - arr[0];
    for (let index = 0; index < needLength; index++) {
      ticks.push(ticks[ticks.length - 1] + tickInterval);
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

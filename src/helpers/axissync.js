import { TextSize } from "victory-core";
import Axis from "./axis";
import VictoryAxis from "../components/victory-axis/victory-axis.js";
import AxisHelper from "../components/victory-axis/helper-methods.js";
import { defaults, range, groupBy, flatten } from "lodash";
import { Helpers } from "victory-core";
import * as d3Scale from "d3-scale";
import * as d3 from "d3";

const defaultFontSize = 12;

const fallbackProps = {
  width: 450,
  height: 300,
  padding: 50
};

const getShortestString = (domain) => {
  const domainStrs = d3.scaleLinear().domain(domain).nice().domain().map((elem) => String(elem));
  return domainStrs
    .reduce((shortest, cur) => cur.length < shortest.length ? cur : shortest, domainStrs[0]);
};

const getSize = (isVertical, sizeObj) => isVertical ? sizeObj.height : sizeObj.width;

// const getTicksAndInterval = (domain, axisRange, tickCount) => ({
//   ticks: d3Scale.scaleLinear().domain(domain).range(axisRange).ticks(tickCount),
//   tickInterval: d3.tickStep(domain[0], domain[1], tickCount)
// });
// const dateSync = () => {
//   const date2 = new Date(2016, 1, 1);
//   const date = new Date(2015, 1, 1);
//   console.log(date);
//   console.log(date2);
//   const diff = date2 - date;
//   console.log(diff);
//   console.log(diff / 5);
//   console.log(new Date(date.getTime() + (diff / 5)));
// }

const getTicksAndInterval = (axisProps, isVertical, tickCount) => {
  const domain = AxisHelper.getDomain(axisProps);
  const axis = AxisHelper.getAxis(axisProps);
  const axisRange = Helpers.getRange(axisProps, axis);
  return {
    ticks: d3Scale.scaleLinear().domain(domain).range(axisRange).ticks(tickCount),
    tickInterval: d3.tickStep(domain[0], domain[1], tickCount)
  };
};

// const getTimeTicksAndInterval = (axisProps, isVertical, tickCount) => ({
//   ticks: d3Scale.scaleTime().domain(axisProps.domain).range(getSize(isVertical, axisProps)).ticks(tickCount),
//   tickInterval: d3.tickStep(axisProps.domain[0], axisProps.domain[1], tickCount)
// });

const syncTicks = (axisTicksArray) =>
  axisTicksArray.map((obj) =>
    ({
      index: obj.index,
      ticks: range(Math.max.apply(null, axisTicksArray.map((tickObj) => tickObj.ticks.length)))
        .map((index) => obj.ticks[0] + obj.tickInterval * (index))
    })
  );


const getLabelCount = (isVertical, props, size) =>
  Math.max(Math.floor((getSize(isVertical, props)) / size), 2);

const getTicksForAxisWithSync = (isVertical, axisGroup) => {
  const maxMinSize = Math.max.apply(null, //Максимально-минимальный размер лейбла для расчета
    axisGroup.map((obj) =>
      getSize(isVertical,
        TextSize.approximateTextSize(
          getShortestString(obj.props.domain),
          defaults(obj.props.style.tickLabels, { fontSize: defaultFontSize })
        )
      )
    )
  );
  return syncTicks(
    axisGroup.map((axisObj) => {
      return Object.assign(
        getTicksAndInterval(
          axisObj.props, isVertical, getLabelCount(isVertical, axisObj.props, maxMinSize)
        ), { index: axisObj.index }
      );
    })
  );
};

const getTicksWithoutSync = (isVertical, axisGroup) => //Все хорошо, но такая ось будет одна.
  axisGroup.map((axisObj) => {
    const minSize = getSize(isVertical, TextSize.approximateTextSize(
      getShortestString(axisObj.props.domain),
      defaults(axisObj.props.style.tickLabels, { fontSize: defaultFontSize })
    ));
    return Object.assign(
      getTicksAndInterval(
        axisObj.props, isVertical, getLabelCount(isVertical, axisObj.props, minSize)
      ), { index: axisObj.index }
     );
  });

const sync = (axisPropsArr) => {
  console.log(getTimeTicksAndInterval({ domain: [new Date(2015, 1, 1), new Date(2016, 1, 1)], height: 100, orientation: "left" }, true, 12));
  const modifyPropsArray = axisPropsArr.map((props) =>
    defaults(props, VictoryAxis.defaultProps, fallbackProps)
  );
  const propsDict = modifyPropsArray.map((props, index) => ({index, props}));
  const groupedAxis = groupBy(propsDict, (obj) => Axis.isVertical(obj.props));
  const result = flatten(Object.keys(groupedAxis).map((key) => {
    const isVertical = key;
    const axisGroup = groupedAxis[isVertical];
    return axisGroup.length > 1
      ? getTicksForAxisWithSync(isVertical, axisGroup)
      : getTicksWithoutSync(isVertical, axisGroup);
  }));
  return result.sort((obj1, obj2) => obj1.index > obj2.index).map((obj) => obj.ticks);
};

export default sync;

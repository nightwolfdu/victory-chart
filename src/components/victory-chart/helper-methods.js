import { invert, sortBy, values } from "lodash";
import Axis from "../../helpers/axis";
import Domain from "../../helpers/domain";
import Wrapper from "../../helpers/wrapper";
import React from "react";
import { Collection, Log } from "victory-core";

const identity = (x) => x;

export default {
  getChildComponents(props, defaultAxes) {
    const childComponents = React.Children.toArray(props.children);
    if (childComponents.length === 0) {
      return [defaultAxes.independent, defaultAxes.dependent];
    }

    const axisComponents = {
      dependent: Axis.getAxisComponentsWithParent(childComponents, "dependent"),
      independent: Axis.getAxisComponentsWithParent(childComponents, "independent")
    };

    if (axisComponents.dependent.length === 0 && axisComponents.independent.length === 0) {
      return [defaultAxes.independent, defaultAxes.dependent].concat(childComponents);
    }
    return childComponents;
  },

  getDefaultDomainPadding(childComponents, horizontal) {
    const groupComponent = childComponents.filter((child) => {
      return child.type && child.type.role && child.type.role === "group-wrapper";
    });
    if (groupComponent.length < 1) {
      return undefined;
    }

    const { offset, children } = groupComponent[0].props;
    return horizontal ?
      { y: (offset * children.length) / 2 } :
      { x: (offset * children.length) / 2 };
  },

  getDataComponents(childComponents) {
    const findDataComponents = (children) => {
      return children.reduce((memo, child) => {
        if (child.type && child.type.role === "axis") {
          return memo;
        } else if (child.props && child.props.children) {
          return memo.concat(findDataComponents(React.Children.toArray(child.props.children)));
        }
        return memo.concat(child);
      }, []);
    };

    return findDataComponents(childComponents);
  },

  getDomain(props, axis, childComponents) {
    childComponents = childComponents || React.Children.toArray(props.children);
    const domain = Wrapper.getDomain(props, axis, childComponents);
    const orientations = Axis.getAxisOrientations(childComponents);
    return Domain.orientDomain(domain, orientations, axis);
  },

  getDomains(props, axis, childComponents) {
    childComponents = childComponents || React.Children.toArray(props.children);
    const domains = Wrapper.getDomains(props, axis, childComponents);
    return domains.map((obj) => {
      const axisName = obj.axisName;
      const checkComponents = childComponents.filter((component) =>
        component.type.role === "axis" &&
        (String(component.props.axisName) === "undefined" || component.props.axisName === axisName)
      );
      return {
        axisName,
        domain: Domain.orientDomain(obj.domain, Axis.getAxisOrientations(checkComponents), axis)
      };
    });
  },

  getAxisOffset(props, calculatedProps) {
    const {axisComponents, scale, origin, originSign} = calculatedProps;
    const filterOrDefault = (objArr) => objArr.filter((obj) => obj.axisName === props.axisName)[0]
        || objArr.filter((obj) => obj.axisName === "undefined")[0] || {};
    const thisAxisComponents = {
      x: filterOrDefault(axisComponents.x),
      y: filterOrDefault(axisComponents.y)
    };
    const thisScale = {
      x: filterOrDefault(scale.x).scale,
      y: filterOrDefault(scale.y).scale
    };
    const thisOrigin = {
      x: filterOrDefault(origin.x).origin,
      y: filterOrDefault(origin.y).origin
    };
    const thisOriginSign = {
      x: filterOrDefault(originSign.x).originSign,
      y: filterOrDefault(originSign.y).originSign
    };
    // make the axes line up, and cross when appropriate
    const axisOrientations = {
      x: Axis.getOrientation(thisAxisComponents.x, "x", thisOriginSign.x),
      y: Axis.getOrientation(thisAxisComponents.y, "y", thisOriginSign.y)
    };
    const orientationOffset = {
      x: axisOrientations.y === "left" ? 0 : props.width,
      y: axisOrientations.x === "bottom" ? props.height : 0
    };
    const calculatedOffset = {
      x: Math.abs(orientationOffset.x - thisScale.x(thisOrigin.x)),
      y: Math.abs(orientationOffset.y - thisScale.y(thisOrigin.y))
    };

    return {
      x: thisAxisComponents.x && thisAxisComponents.x.offsetX || calculatedOffset.x,
      y: thisAxisComponents.y && thisAxisComponents.y.offsetY || calculatedOffset.y
    };
  },

  getTicksFromData(calculatedProps, axis, component) {
    const currentAxis = Axis.getCurrentAxis(axis, calculatedProps.horizontal);
    const currentAxisName = Wrapper.getAxisNameFromPropsAndAxis(component.props, axis);
    const strMap = calculatedProps.stringMap[currentAxis];
    const stringMap = !strMap ? undefined
      : strMap.filter((obj) => obj.axisName === currentAxisName)[0].stringMap;
    // if tickValues are defined for an axis component use them
    const categoryArr = calculatedProps.categories[currentAxis];
    const categoryArray = !categoryArr ? undefined
      : categoryArr.filter((obj) => obj.axisName === currentAxisName)[0].strings;
    const ticksFromCategories = categoryArray && Collection.containsOnlyStrings(categoryArray) ?
      categoryArray.map((tick) => stringMap[tick]) : categoryArray;
    const ticksFromStringMap = stringMap && values(stringMap);
    // when ticks is undefined, axis will determine it's own ticks
    return ticksFromCategories && ticksFromCategories.length !== 0 ?
      ticksFromCategories : ticksFromStringMap;
  },

  getTicksFromAxis(calculatedProps, axis, component) {
    const tickValues = component.props.tickValues;
    if (!tickValues) {
      return undefined;
    }
    const currentAxis = Axis.getCurrentAxis(axis, calculatedProps.horizontal);
    const axisName = String(component.props.axisName);
    const stringMap = calculatedProps.stringMap[currentAxis]
      .filter((obj) => obj.axisName === String(axisName))[0].stringMap;
    return Collection.containsOnlyStrings(tickValues) && stringMap ?
      tickValues.map((tick) => stringMap[tick]) : tickValues;
  },

  getTicks(...args) {
    return this.getTicksFromAxis(...args) || this.getTicksFromData(...args);
  },

  getTickFormat(component, axis, calculatedProps) {
    const currentAxis = Axis.getCurrentAxis(axis, calculatedProps.horizontal);
    const currentAxisName = Wrapper.getAxisNameFromPropsAndAxis(component.props, axis);
    const strMap = calculatedProps.stringMap[currentAxis];
    const stringMap = !strMap ? undefined
      : strMap.filter((obj) => obj.axisName === currentAxisName)[0].stringMap;
    const tickValues = component.props.tickValues;
    const useIdentity = tickValues && !Collection.containsStrings(tickValues) &&
      !Collection.containsDates(tickValues);
    if (useIdentity) {
      return identity;
    } else if (stringMap) {
      const tickValueArray = sortBy(values(stringMap), (n) => n);
      const invertedStringMap = invert(stringMap);
      const dataNames = tickValueArray.map((tick) => invertedStringMap[tick]);
      // string ticks should have one tick of padding at the beginning
      const dataTicks = ["", ...dataNames, ""];
      return (x) => dataTicks[x];
    } else {
      return calculatedProps.scale[currentAxis]
        .filter((scObj) => scObj.axisName === currentAxisName)[0].scale.tickFormat() || identity;
    }
  },

  createStringMap(props, axis, childComponents) {
    const allStrings = Wrapper.getStringsFromChildren(props, axis, childComponents);
    return allStrings.length === 0 ? null :
      allStrings.map((obj) => ({
        axisName: obj.axisName,
        stringMap: obj.strings.reduce((memo, string, index) => {
          memo[string] = index + 1;
          return memo;
        }, {})
      }));
  }
};

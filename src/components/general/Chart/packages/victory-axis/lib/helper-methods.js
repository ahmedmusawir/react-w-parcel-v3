import _isFunction from "lodash/isFunction";
import _defaults from "lodash/defaults";
import _assign from "lodash/assign";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

import { Helpers, Scale, Axis } from "victory-core";
var orientationSign = {
  top: -1,
  left: -1,
  right: 1,
  bottom: 1
};

var evaluateProp = function (prop, data, index) {
  return _isFunction(prop) ? prop(data, index) : prop;
};

var evaluateStyle = function (style, data, index) {
  if (!style || !Object.keys(style).some(function (value) {
    return _isFunction(style[value]);
  })) {
    return style;
  }

  return Object.keys(style).reduce(function (prev, curr) {
    prev[curr] = evaluateProp(style[curr], data, index);
    return prev;
  }, {});
}; // exposed for use by VictoryChart


var getScale = function (props) {
  var axis = Axis.getAxis(props);
  var scale = Scale.getBaseScale(props, axis);
  var domain = Axis.getDomain(props) || scale.domain();
  scale.range(Helpers.getRange(props, axis));
  scale.domain(domain);
  return scale;
};

var getStyleObject = function (props) {
  var theme = props.theme,
      dependentAxis = props.dependentAxis;
  var generalAxisStyle = theme && theme.axis && theme.axis.style;
  var axisType = dependentAxis ? "dependentAxis" : "independentAxis";
  var specificAxisStyle = theme && theme[axisType] && theme[axisType].style;

  var mergeStyles = function () {
    var styleNamespaces = ["axis", "axisLabel", "grid", "parent", "tickLabels", "ticks"];
    return styleNamespaces.reduce(function (memo, curr) {
      memo[curr] = _defaults({}, specificAxisStyle[curr], generalAxisStyle[curr]);
      return memo;
    }, {});
  };

  return generalAxisStyle && specificAxisStyle ? mergeStyles() : specificAxisStyle || generalAxisStyle;
};

var getStyles = function (props, styleObject) {
  var style = props.style || {};
  styleObject = styleObject || {};
  var parentStyleProps = {
    height: "100%",
    width: "100%"
  };
  return {
    parent: _defaults(style.parent, styleObject.parent, parentStyleProps),
    axis: _defaults({}, style.axis, styleObject.axis),
    axisLabel: _defaults({}, style.axisLabel, styleObject.axisLabel),
    grid: _defaults({}, style.grid, styleObject.grid),
    ticks: _defaults({}, style.ticks, styleObject.ticks),
    tickLabels: _defaults({}, style.tickLabels, styleObject.tickLabels)
  };
};

var getTickProps = function (layout, style, datum) {
  var position = layout.position,
      transform = layout.transform;
  return {
    x1: transform.x,
    y1: transform.y,
    x2: transform.x + position.x2,
    y2: transform.y + position.y2,
    style: style,
    datum: datum
  };
}; // eslint-disable-next-line max-params


var getTickLabelProps = function (layout, style, anchors, datum, text) {
  var position = layout.position,
      transform = layout.transform;
  return {
    style: style,
    x: transform.x + position.x,
    y: transform.y + position.y,
    verticalAnchor: anchors.verticalAnchor,
    textAnchor: anchors.textAnchor,
    angle: style.angle,
    text: text,
    datum: datum
  };
};

var getGridProps = function (layout, style, datum) {
  var edge = layout.edge,
      transform = layout.transform;
  return {
    type: "grid",
    x1: transform.x,
    y1: transform.y,
    x2: edge.x + transform.x,
    y2: edge.y + transform.y,
    style: style,
    datum: datum
  };
};

var getAxisProps = function (modifiedProps, calculatedValues, globalTransform) {
  var style = calculatedValues.style,
      padding = calculatedValues.padding,
      isVertical = calculatedValues.isVertical;
  var width = modifiedProps.width,
      height = modifiedProps.height;
  return {
    type: "axis",
    style: style.axis,
    x1: isVertical ? globalTransform.x : padding.left + globalTransform.x,
    x2: isVertical ? globalTransform.x : width - padding.right + globalTransform.x,
    y1: isVertical ? padding.top + globalTransform.y : globalTransform.y,
    y2: isVertical ? height - padding.bottom + globalTransform.y : globalTransform.y
  };
};

var getEvaluatedStyles = function (style, tick, index) {
  return {
    tickStyle: evaluateStyle(style.ticks, tick, index),
    labelStyle: evaluateStyle(style.tickLabels, tick, index),
    gridStyle: evaluateStyle(style.grid, tick, index)
  };
};

var getRole = function (props) {
  if (props.dependentAxis) {
    return props.theme && props.theme.dependentAxis ? "dependentAxis" : "axis";
  }

  return props.theme && props.theme.independentAxis ? "independentAxis" : "axis";
};

var getShallowMergedThemeProps = function (props, role) {
  var axisTheme = props.theme.axis || {};
  return _defaults({}, props.theme[role], axisTheme);
};

var modifyProps = function (props, fallbackProps, role) {
  if (role !== "axis") {
    props.theme[role] = getShallowMergedThemeProps(props, role);
  }

  return Helpers.modifyProps(props, fallbackProps, role);
};

var getAxisLabelProps = function (props, calculatedValues, globalTransform) {
  var style = calculatedValues.style,
      orientation = calculatedValues.orientation,
      padding = calculatedValues.padding,
      labelPadding = calculatedValues.labelPadding,
      isVertical = calculatedValues.isVertical;
  var sign = orientationSign[orientation];
  var hPadding = padding.left + padding.right;
  var vPadding = padding.top + padding.bottom;
  var verticalAnchor = sign < 0 ? "end" : "start";
  var labelStyle = style.axisLabel;
  var angle = isVertical ? -90 : 0; // eslint-disable-line no-magic-numbers

  var x = isVertical ? globalTransform.x + sign * labelPadding : (props.width - hPadding) / 2 + padding.left + globalTransform.x;
  var y = isVertical ? (props.height - vPadding) / 2 + padding.top + globalTransform.y : sign * labelPadding + globalTransform.y;
  return {
    x: x,
    y: y,
    verticalAnchor: labelStyle.verticalAnchor || verticalAnchor,
    textAnchor: labelStyle.textAnchor || "middle",
    angle: labelStyle.angle === undefined ? angle : labelStyle.angle,
    style: labelStyle,
    text: props.label
  };
};

var getAnchors = function (orientation, isVertical) {
  var anchorOrientation = {
    top: "end",
    left: "end",
    right: "start",
    bottom: "start"
  };
  var anchor = anchorOrientation[orientation];
  return {
    textAnchor: isVertical ? anchor : "middle",
    verticalAnchor: isVertical ? "middle" : anchor
  };
};

var getLabelPadding = function (props, style) {
  var labelStyle = style.axisLabel || {};

  if (labelStyle.padding !== undefined && labelStyle.padding !== null) {
    return labelStyle.padding;
  }

  var isVertical = Axis.isVertical(props); // TODO: magic numbers

  /*eslint-disable no-magic-numbers*/

  var fontSize = labelStyle.fontSize || 14;
  return props.label ? fontSize * (isVertical ? 2.3 : 1.6) : 0;
  /*eslint-enable no-magic-numbers*/
};

var getOffset = function (props, calculatedValues) {
  var style = calculatedValues.style,
      padding = calculatedValues.padding,
      isVertical = calculatedValues.isVertical,
      orientation = calculatedValues.orientation,
      labelPadding = calculatedValues.labelPadding,
      stringTicks = calculatedValues.stringTicks,
      ticks = calculatedValues.ticks;
  var xPadding = orientation === "right" ? padding.right : padding.left;
  var yPadding = orientation === "top" ? padding.top : padding.bottom;
  var fontSize = style.axisLabel.fontSize || 14; // eslint-disable-line no-magic-numbers

  var offsetX = props.offsetX !== null && props.offsetX !== undefined ? props.offsetX : xPadding;
  var offsetY = props.offsetY !== null && props.offsetY !== undefined ? props.offsetY : yPadding;
  var tickSizes = ticks.map(function (data) {
    var tick = stringTicks ? props.tickValues[data - 1] : data;
    var tickStyle = evaluateStyle(style.ticks, tick);
    return tickStyle.size || 0;
  });
  var totalPadding = fontSize + 2 * Math.max.apply(Math, _toConsumableArray(tickSizes)) + labelPadding;
  var minimumPadding = 1.2 * fontSize; // eslint-disable-line no-magic-numbers

  var x = isVertical ? totalPadding : minimumPadding;
  var y = isVertical ? minimumPadding : totalPadding;
  return {
    x: offsetX !== null && offsetX !== undefined ? offsetX : x,
    y: offsetY !== null && offsetY !== undefined ? offsetY : y
  };
};

var getTransform = function (props, calculatedValues, offset) {
  var orientation = calculatedValues.orientation;
  return {
    top: {
      x: 0,
      y: offset.y
    },
    bottom: {
      x: 0,
      y: props.height - offset.y
    },
    left: {
      x: offset.x,
      y: 0
    },
    right: {
      x: props.width - offset.x,
      y: 0
    }
  }[orientation];
};

var getTickPosition = function (style, orientation, isVertical) {
  var tickStyle = style.tickStyle,
      labelStyle = style.labelStyle;
  var size = tickStyle.size || 0;
  var tickPadding = tickStyle.padding || 0;
  var labelPadding = labelStyle.padding || 0;
  var tickSpacing = size + tickPadding + labelPadding;
  var sign = orientationSign[orientation];
  return {
    x: isVertical ? sign * tickSpacing : 0,
    x2: isVertical ? sign * size : 0,
    y: isVertical ? 0 : sign * tickSpacing,
    y2: isVertical ? 0 : sign * size
  };
};

var getTickTransform = function (tick, globalTransform, isVertical) {
  return {
    x: isVertical ? globalTransform.x : tick + globalTransform.x,
    y: isVertical ? tick + globalTransform.y : globalTransform.y
  };
};

var getGridEdge = function (props, calculatedValues) {
  var orientation = calculatedValues.orientation,
      padding = calculatedValues.padding,
      isVertical = calculatedValues.isVertical;
  var sign = -orientationSign[orientation];
  var x = isVertical ? sign * (props.width - (padding.left + padding.right)) : 0;
  var y = isVertical ? 0 : sign * (props.height - (padding.top + padding.bottom));
  return {
    x: x,
    y: y
  };
};

var getGridOffset = function (props, calculatedValues, offset) {
  var padding = calculatedValues.padding,
      orientation = calculatedValues.orientation;
  var xPadding = orientation === "right" ? padding.right : padding.left;
  var yPadding = orientation === "top" ? padding.top : padding.bottom;
  return {
    x: props.crossAxis ? offset.x - xPadding : 0,
    y: props.crossAxis ? offset.y - yPadding : 0
  };
};

var getLayoutProps = function (modifiedProps, calculatedValues) {
  var offset = getOffset(modifiedProps, calculatedValues);
  return {
    globalTransform: getTransform(modifiedProps, calculatedValues, offset),
    gridOffset: getGridOffset(modifiedProps, calculatedValues, offset),
    gridEdge: getGridEdge(modifiedProps, calculatedValues)
  };
};

var getCalculatedValues = function (props) {
  var defaultStyles = getStyleObject(props);
  var style = getStyles(props, defaultStyles);
  var padding = Helpers.getPadding(props);
  var orientation = props.orientation || (props.dependentAxis ? "left" : "bottom");
  var isVertical = Axis.isVertical(props);
  var labelPadding = getLabelPadding(props, style);
  var stringTicks = Axis.stringTicks(props) ? props.tickValues : undefined;
  var axis = Axis.getAxis(props);
  var scale = getScale(props);
  var domain = Axis.getDomain(props);
  var ticks = Axis.getTicks(props, scale, props.crossAxis);
  var tickFormat = Axis.getTickFormat(props, scale);
  var anchors = getAnchors(orientation, isVertical);
  return {
    axis: axis,
    style: style,
    padding: padding,
    orientation: orientation,
    isVertical: isVertical,
    labelPadding: labelPadding,
    stringTicks: stringTicks,
    anchors: anchors,
    scale: scale,
    ticks: ticks,
    tickFormat: tickFormat,
    domain: domain
  };
};

var getBaseProps = function (props, fallbackProps) {
  var role = getRole(props);
  props = modifyProps(props, fallbackProps, role);
  var calculatedValues = getCalculatedValues(props);
  var axis = calculatedValues.axis,
      style = calculatedValues.style,
      orientation = calculatedValues.orientation,
      isVertical = calculatedValues.isVertical,
      scale = calculatedValues.scale,
      ticks = calculatedValues.ticks,
      tickFormat = calculatedValues.tickFormat,
      anchors = calculatedValues.anchors,
      domain = calculatedValues.domain,
      stringTicks = calculatedValues.stringTicks,
      name = calculatedValues.name;
  var otherAxis = axis === "x" ? "y" : "x";
  var _props = props,
      width = _props.width,
      height = _props.height,
      standalone = _props.standalone,
      theme = _props.theme,
      polar = _props.polar,
      padding = _props.padding;

  var _getLayoutProps = getLayoutProps(props, calculatedValues),
      globalTransform = _getLayoutProps.globalTransform,
      gridOffset = _getLayoutProps.gridOffset,
      gridEdge = _getLayoutProps.gridEdge;

  var sharedProps = {
    scale: _defineProperty({}, axis, scale),
    polar: polar
  };
  var axisProps = getAxisProps(props, calculatedValues, globalTransform);
  var axisLabelProps = getAxisLabelProps(props, calculatedValues, globalTransform);
  var initialChildProps = {
    parent: _assign({
      style: style.parent,
      ticks: ticks,
      standalone: standalone,
      theme: theme,
      width: width,
      height: height,
      padding: padding,
      domain: domain,
      name: name
    }, sharedProps)
  };
  var gridProps = {
    dimension: otherAxis,
    range: _defineProperty({}, otherAxis, Helpers.getRange(props, otherAxis)),
    scale: props.scale && props.scale[otherAxis] ? _defineProperty({}, otherAxis, props.scale[otherAxis]) : undefined
  };
  return ticks.reduce(function (childProps, tick, index) {
    var originalTick = stringTicks ? stringTicks[index] : tick;
    var styles = getEvaluatedStyles(style, originalTick, index);
    var tickLayout = {
      position: getTickPosition(styles, orientation, isVertical),
      transform: getTickTransform(scale(tick), globalTransform, isVertical)
    };
    var gridLayout = {
      edge: gridEdge,
      transform: {
        x: isVertical ? -gridOffset.x + globalTransform.x : scale(tick) + globalTransform.x,
        y: isVertical ? scale(tick) + globalTransform.y : gridOffset.y + globalTransform.y
      }
    };
    childProps[index] = {
      axis: _assign({
        dimension: axis
      }, sharedProps, axisProps),
      axisLabel: _assign({}, sharedProps, axisLabelProps),
      ticks: _assign({}, sharedProps, getTickProps(tickLayout, styles.tickStyle, tick)),
      tickLabels: _assign({}, sharedProps, getTickLabelProps(tickLayout, styles.labelStyle, anchors, tick, tickFormat(tick, index, ticks))),
      grid: _assign({}, sharedProps, gridProps, getGridProps(gridLayout, styles.gridStyle, tick))
    };
    return childProps;
  }, initialChildProps);
};

export { getBaseProps, getScale, getStyles };
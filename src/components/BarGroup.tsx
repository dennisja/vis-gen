import { AxisBottom } from '@visx/axis';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { BarGroup as VXBarGroup } from '@visx/shape';
import { DatumObject } from '@visx/shape/lib/types';
import { useMemo } from 'react';

const DEFAULT_MARGIN = { top: 40, right: 0, bottom: 40, left: 0 };
const COLORS = {
  bg: '#0C0D42',
  blue: '#5493F0',
  green: '#38E288',
  pink: '#FC6B6F',
};
const DEFAULT_BAR_COLORS = [COLORS.blue, COLORS.green, COLORS.pink];

// scales
function createXScale<Datum>(
  data: Datum[],
  getXValue: BarGroupProps<Datum>['xAccessor'],
  xMax: number,
) {
  const xScale = scaleBand<string>({
    domain: data.map(getXValue),
    padding: 0.2,
  });
  xScale.rangeRound([0, xMax]);
  return xScale;
}

function createBarGroupScale<Key extends GroupKey = GroupKey>(
  groupKeys: Key[],
  groupBarWidth: number,
) {
  const groupBarScale = scaleBand<Key>({ domain: groupKeys, padding: 0.1 });
  groupBarScale.rangeRound([0, groupBarWidth]);
  return groupBarScale;
}

function createYScale<Datum, Key extends GroupKey = GroupKey>(
  data: Datum[],
  getMaxGroupValue: (d: Datum, groupKeys: Key[]) => number,
  yMax: number,
  groupKeys: Key[],
) {
  const yScale = scaleLinear<number>({
    domain: [
      0,
      Math.max(...data.map(datum => getMaxGroupValue(datum, groupKeys))),
    ],
  });
  yScale.range([yMax, 0]);
  return yScale;
}

function createColorScale<Key extends GroupKey = GroupKey>(
  groupKeys: Key[],
  colors: string[],
) {
  const colorScale = scaleOrdinal<Key, string>({
    domain: groupKeys,
    range: colors,
  });
  return colorScale;
}

type GroupKey = string | number;

type Margin = { top: number; right: number; bottom: number; left: number };

type BarGroupProps<Datum, Key extends GroupKey = GroupKey> = {
  data: Datum[];
  width: number;
  height: number;
  margin?: Margin;
  events?: boolean;
  yMaxAccessor: (d: Datum, groupKeys: Key[]) => number;
  xAccessor: (d: Datum) => string;
  getGroupKeys: (d: Datum) => Key[];
  formatXValue: (value: string) => string;
  barColors?: string[];
};

export function BarGroup<
  Datum extends DatumObject,
  Key extends GroupKey = GroupKey,
>({
  width,
  height,
  events = false,
  margin = DEFAULT_MARGIN,
  data,
  xAccessor,
  yMaxAccessor,
  getGroupKeys,
  formatXValue,
  barColors = DEFAULT_BAR_COLORS,
}: BarGroupProps<Datum, Key>): JSX.Element | null {
  // bounds
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const groupKeys = useMemo(() => getGroupKeys(data[0]), [data, getGroupKeys]);

  // scales
  const xScale = useMemo(
    () => createXScale(data, xAccessor, xMax),
    [data, xAccessor, xMax],
  );
  const barWidth = xScale.bandwidth();
  const groupBarScale = useMemo(
    () => createBarGroupScale(groupKeys, barWidth),
    [groupKeys, barWidth],
  );
  const yScale = useMemo(
    () => createYScale(data, yMaxAccessor, yMax, groupKeys),
    [data, yMaxAccessor, yMax, groupKeys],
  );
  const colorScale = useMemo(
    () => createColorScale(groupKeys, barColors),
    [groupKeys, barColors],
  );

  if (width < 10) return null;

  return (
    <svg width={width} height={height}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={14}
        fill={COLORS.bg}
      />
      <Group top={margin.top} left={margin.left}>
        <VXBarGroup
          data={data}
          keys={groupKeys}
          height={yMax}
          x0={xAccessor}
          x0Scale={xScale}
          x1Scale={groupBarScale}
          yScale={yScale}
          color={colorScale}
        >
          {barGroups =>
            barGroups.map(barGroup => (
              <Group
                key={`bar-group-${barGroup.index}-${barGroup.x0}`}
                left={barGroup.x0}
              >
                {barGroup.bars.map(bar => (
                  <rect
                    key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                    x={bar.x}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    fill={bar.color}
                    rx={4}
                    onClick={() => {
                      if (!events) return;
                      const { key, value } = bar;
                      console.log({ key, value });
                    }}
                  />
                ))}
              </Group>
            ))
          }
        </VXBarGroup>
      </Group>
      <AxisBottom
        top={yMax + margin.top}
        tickFormat={formatXValue}
        scale={xScale}
        stroke={COLORS.green}
        tickStroke={COLORS.green}
        hideAxisLine
        tickLabelProps={() => ({
          fill: COLORS.green,
          fontSize: 11,
          textAnchor: 'middle',
        })}
      />
    </svg>
  );
}

import cityTemperature, {
  CityTemperature,
} from '@visx/mock-data/lib/mocks/cityTemperature';
import { timeParse, timeFormat } from 'd3-time-format';

import './App.css';
import { BarGroup } from './components/BarGroup';

const DATA = cityTemperature.slice(0, 8);

type CityName = 'New York' | 'San Francisco' | 'Austin';

// accessors
const getDate = (d: CityTemperature) => d.date;

const getGroupMaxCityTemperature = (
  data: CityTemperature,
  cities: CityName[],
): number => Math.max(...cities.map(city => Number(data[city])));

const getCityNames = (datum: CityTemperature) =>
  Object.keys(datum).filter(d => d !== 'date') as CityName[];

// formatters
const parseDate = timeParse('%Y-%m-%d');
const format = timeFormat('%b %d');
const formatDate = (date: string) => format(parseDate(date) as Date);

function App() {
  return (
    <BarGroup<CityTemperature, CityName>
      data={DATA}
      width={900}
      height={600}
      xAccessor={getDate}
      yMaxAccessor={getGroupMaxCityTemperature}
      formatXValue={formatDate}
      getGroupKeys={getCityNames}
    />
  );
}

export default App;

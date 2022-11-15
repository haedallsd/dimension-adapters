import axios from "axios";
import fetchURL from "../../utils/fetchURL"
import { SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";
import { getUniqStartOfTodayTimestamp } from "../../helpers/getUniSubgraphVolume";

const dateFrom = 1630584906;
const historicalVolumeEndpoint = (dateTo: number) => `https://api.paintswap.finance/v2/marketplaceDayDatas?numToSkip=0&numToFetch=1000&orderDirection=asc&dateFrom=${dateFrom}&dateTo=${dateTo}`;

interface IVolumeall {
  dailyVolume: string;
  date: number;
}

const fetch = async (timestamp: number) => {
  const dayTimestamp = getUniqStartOfTodayTimestamp(new Date(timestamp * 1000))
  const historicalVolume: IVolumeall[] = (await fetchURL(historicalVolumeEndpoint(dayTimestamp)))?.data.marketPlaceDayDatas;
  const totalVolume = historicalVolume
    .filter(volItem => (new Date(volItem.date).getTime()) <= dayTimestamp)
    .reduce((acc, { dailyVolume }) => acc + Number(dailyVolume), 0)

  const dailyVolume = historicalVolume
    .find(dayItem => (new Date(dayItem.date).getTime()) === dayTimestamp)?.dailyVolume

  const prices = await axios.post('https://coins.llama.fi/prices', {
    "coins": [
      "coingecko:fantom",
    ],
    timestamp: dayTimestamp
  });

  return {
    timestamp: dayTimestamp,
    totalVolume: totalVolume ? String(totalVolume/1e18 * prices.data.coins["coingecko:fantom"].price) : "0",
    dailyVolume: dailyVolume ? String(Number(dailyVolume)/1e18 * prices.data.coins["coingecko:fantom"].price) : "0"
  };
};


const adapter: SimpleAdapter = {
  adapter: {
    [CHAIN.FANTOM]: {
      fetch,
      start: async () => 1630584906,
    },
  },
};

export default adapter;

import useSWR from "swr";
import { endpoints, fetcher } from "./snapshot";

export type LeveragedTokenHistoricalData = {
    timestamp: string;
    collateral_per_leveraged_token: number;
    debt_per_leveraged_token: number;
    leverage_ratio: number;
    nav: number;
};

function filterOutSameNAV(data: Array<LeveragedTokenHistoricalData> | undefined): Array<LeveragedTokenHistoricalData> | undefined {
    if (!data) return undefined;
    return [...new Map(data.map((item) => [item["nav"], item])).values()];
}

export type LeveragedTokenTimeframeData = {
    latestNAV: number;
    oldestNAV: number;
    change: number;
    data: Array<LeveragedTokenHistoricalData>;
};

export function useLeveragedTokenHistoricalData(chainID: number, leveragedTokenAddress: string) {
    const endpoint = endpoints[chainID];
    const { data, error } = useSWR<Array<LeveragedTokenHistoricalData>, Error>(
        `${endpoint}/v1/leveragedTokens/3months/${leveragedTokenAddress}`,
        fetcher
    );

    const cleanedData = filterOutSameNAV(data);
    let dailyData: LeveragedTokenTimeframeData | undefined = undefined;
    let weeklyData: LeveragedTokenTimeframeData | undefined = undefined;
    let twoWeeklyData: LeveragedTokenTimeframeData | undefined = undefined;
    let monthlyData: LeveragedTokenTimeframeData | undefined = undefined;
    let threeMonthlyData: LeveragedTokenTimeframeData | undefined = undefined;

    if (cleanedData) {
        // Get daily data
        const dailyTimeframeData = cleanedData.slice(-24); // 1 day = 24 hours
        const dailyLatestData = dailyTimeframeData[dailyTimeframeData.length - 1];
        const dailyOldestData = dailyTimeframeData[0];
        const dailyLatestNAV = dailyLatestData.nav;
        const dailyOldestNAV = dailyOldestData.nav;
        const dailyChange = ((dailyLatestNAV - dailyOldestNAV) / dailyOldestNAV) * 100;
        dailyData = {
            latestNAV: dailyLatestNAV,
            oldestNAV: dailyOldestNAV,
            change: dailyChange,
            data: dailyTimeframeData,
        };

        // Get weekly data
        const weeklyTimeframeData = cleanedData.slice(-168); // 1 week = 168 hours
        const weeklyLatestData = weeklyTimeframeData[weeklyTimeframeData.length - 1];
        const weeklyOldestData = weeklyTimeframeData[0];
        const weeklyLatestNAV = weeklyLatestData.nav;
        const weeklyOldestNAV = weeklyOldestData.nav;
        const weeklyChange = ((weeklyLatestNAV - weeklyOldestNAV) / weeklyOldestNAV) * 100;
        weeklyData = {
            latestNAV: weeklyLatestNAV,
            oldestNAV: weeklyOldestNAV,
            change: weeklyChange,
            data: weeklyTimeframeData,
        };

        // Get two weekly data
        const twoWeeklyTimeframeData = cleanedData.slice(-336); // 2 weeks = 336 hours
        const twoWeeklyLatestData = twoWeeklyTimeframeData[twoWeeklyTimeframeData.length - 1];
        const twoWeeklyOldestData = twoWeeklyTimeframeData[0];
        const twoWeeklyLatestNAV = twoWeeklyLatestData.nav;
        const twoWeeklyOldestNAV = twoWeeklyOldestData.nav;
        const twoWeeklyChange = ((twoWeeklyLatestNAV - twoWeeklyOldestNAV) / twoWeeklyOldestNAV) * 100;
        twoWeeklyData = {
            latestNAV: twoWeeklyLatestNAV,
            oldestNAV: twoWeeklyOldestNAV,
            change: twoWeeklyChange,
            data: twoWeeklyTimeframeData,
        };

        // Get monthly data
        const monthlyTimeframeData = cleanedData.slice(-672); // 1 month = 672 hours
        const monthlyLatestData = monthlyTimeframeData[monthlyTimeframeData.length - 1];
        const monthlyOldestData = monthlyTimeframeData[0];
        const monthlyLatestNAV = monthlyLatestData.nav;
        const monthlyOldestNAV = monthlyOldestData.nav;
        const monthlyChange = ((monthlyLatestNAV - monthlyOldestNAV) / monthlyOldestNAV) * 100;
        monthlyData = {
            latestNAV: monthlyLatestNAV,
            oldestNAV: monthlyOldestNAV,
            change: monthlyChange,
            data: monthlyTimeframeData,
        };

        // Get three monthly data
        const threeMonthlyTimeframeData = cleanedData.slice(-2016); // 3 months = 2016 hours
        const threeMonthlyLatestData = threeMonthlyTimeframeData[threeMonthlyTimeframeData.length - 1];
        const threeMonthlyOldestData = threeMonthlyTimeframeData[0];
        const threeMonthlyLatestNAV = threeMonthlyLatestData.nav;
        const threeMonthlyOldestNAV = threeMonthlyOldestData.nav;
        const threeMonthlyChange = ((threeMonthlyLatestNAV - threeMonthlyOldestNAV) / threeMonthlyOldestNAV) * 100;
        threeMonthlyData = {
            latestNAV: threeMonthlyLatestNAV,
            oldestNAV: threeMonthlyOldestNAV,
            change: threeMonthlyChange,
            data: threeMonthlyTimeframeData,
        };
    }

    return {
        daily: dailyData,
        weekly: weeklyData,
        twoWeekly: twoWeeklyData,
        monthly: monthlyData,
        threeMonthly: threeMonthlyData,
        isLoading: !error && !data,
        error: error,
    };
}

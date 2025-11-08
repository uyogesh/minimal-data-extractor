export const isSharehubFloorsheetPage = (url: string): boolean => {
    return url.includes('sharehubnepal.com/nepse/floorsheet');
};

// 2020-01-02 -> 2020-1-2
export const trimFixedDateString = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    const trimmedDate = `${year}-${trimZeroes(month)}-${trimZeroes(day)}`;
    return trimmedDate;
};

export const trimZeroes = (numStr: string): string => {
    return numStr.replace(/^0+/, '') || '0';
};

export const parseNumber = (numStr: string): number => {
    const cleanedStr = numStr.replace(/,/g, '').trim();
    return parseFloat(cleanedStr);
};

export const formatNumber = (num: number, decimalPlaces: number = 2): string => {
    return num.toFixed(decimalPlaces).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
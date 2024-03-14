
import packageInfo from '../package.json';

export enum BullApiStatusEnum {
  Operational = 'OPERATIONAL',
  Maintenance = 'MAINTENANCE',
  // Outdated = 'OUTDATED',
  Down = 'DOWN',
}

export type BullSdkDetailsType = {
  message: string,
  version: string,
  currentVersion: string,
  lastUpdate: string, // Format: YYYY-MM-DD
  documentationUrl: string,
  supportEmail: string,
  status: BullApiStatusEnum,
}

const getLastUpdate = async (packageName: string): Promise<Pick<BullSdkDetailsType, 'lastUpdate' | 'version'>> => {
  const url = `https://registry.npmjs.org/${packageName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  const versions = Object.keys(data.time);
  const version = versions[versions.length - 1];
  return {
    version,
    lastUpdate: data.time[version]
  }
}

const fetchApiStatus = async (): Promise<BullApiStatusEnum> => {

  const url = 'bullbitcoin.com';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const { data } = await response.json();
    return (data?.status || BullApiStatusEnum.Maintenance) as BullApiStatusEnum;
  } catch (error) {
    return BullApiStatusEnum.Down;
  }
}

export const getSdkDetails = async (): Promise<BullSdkDetailsType> => {
  return {
    message: "Welcome on Bull Bitcoin TypeScript SDK",
    ...(await getLastUpdate('@bullbitcoin/sdk')),
    currentVersion: packageInfo.version,
    documentationUrl: 'https://github.com/SatoshiPortal/TS-SDK/',
    supportEmail: 'support@bullbitcoin.com',
    status: await fetchApiStatus(),
  }
}

//
// TS SDK Details
// ==============
//
// Get informations about the SDK and the Bull Bitcoin API
//

export enum BullApiStatusEnum {
  Operational = 'OPERATIONAL',
  Maintenance = 'MAINTENANCE',
  Down = 'DOWN',
}

export type BullSdkDetailsType = {
  message: string,
  lastSdkVersion: string,
  lastSdkUpdate: Date,
  documentationUrl: string,
  supportEmail: string,
  status: BullApiStatusEnum,
}

export const getLastPackageVersion = async (packageName: string): Promise<{ lastVersion: string, lastUpdate: Date }> => {
  const url = `https://registry.npmjs.org/${packageName}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  // const versions = Object.keys(data.time);
  // const lastVersion = versions[versions.length - 1];

  const lastVersion = data['dist-tags'].latest;
  const lastUpdate = data.time[lastVersion];

  return {
    lastVersion,
    lastUpdate
  }
}

const fetchApiStatus = async (): Promise<BullApiStatusEnum> => {

  const url = 'api.bullbitcoin.com';

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
  const { lastVersion: lastSdkVersion, lastUpdate: lastSdkUpdate } = await getLastPackageVersion('@bullbitcoin/sdk')

  return {
    message: "Bull Bitcoin API TypeScript SDK",
    lastSdkVersion,
    lastSdkUpdate,
    documentationUrl: 'https://github.com/SatoshiPortal/TS-SDK/',
    supportEmail: 'support@bullbitcoin.com',
    status: await fetchApiStatus(),
  }
}
import { Cloud as CloudV1 } from './V1/cloud';
import { Local as LocalV1 } from './V1/local';
import { Cloud as CloudV2 } from './V2/cloud';
import { Local as LocalV2 } from './V2/local';
import { Cloud as CloudV3 } from './V3/cloud';
import { Local as LocalV3 } from './V3/local';


export * as CloudV1 from './V1/cloud';
export * as LocalV1 from './V1/local';
export * as CloudV2 from './V2/cloud';
export * as LocalV2 from './V2/local';
export * as CloudV3 from './V3/cloud';
export * as LocalV3 from './V3/local';

export * from './global';

export function Cloud(username: string, password: string, version?: number): Partial<CloudV2 & CloudV3> & (CloudV2 | CloudV3);
export function Cloud(username: string, password: string, version: 1): CloudV1;
export function Cloud(username: string, password: string, version: 2): CloudV2;
export function Cloud(username: string, password: string, version: 3): CloudV3;

export function Local(blid: string, password: string, ip: string, version?: number, interval?: number): Partial<LocalV2 & LocalV3> & (LocalV2 | LocalV3);
export function Local(blid: string, password: string, ip: string, version: 1): LocalV1;
export function Local(blid: string, password: string, ip: string, version: 2, interval?: number): LocalV2;
export function Local(blid: string, password: string, ip: string, version: 3, interval?: number): LocalV3;

/**
 * If you don't known which IP address to use in {@link Local()} you can use {@link getRobotIP()} to find it. This process takes 1-2 seconds, so if you know the IP you can just use it explicity.
 *
 * You need UDP broadcast enabled in your network!
 * 
 * @example ```javascript
 * var dorita980 = require('dorita980');
 *
 * dorita980.getRobotIP((ierr, ip) => {
 *   if (ierr) return console.log('error looking for robot IP');
 *
 *   var myRobotViaLocal = dorita980.Local('MyUsernameBlid', 'MyPassword', ip);
 *
 *   myRobotViaLocal.getMission()
 *     .then((mission) => {
 *       console.log(mission);
 *     }).catch((err) => {
 *       console.log(err);
 *     });
 *   });
 * ```
 */
export function getRobotIP(callback: (err: unknown, ip: string) => void): void;
/**
 * You can also use {@link discovery} method to get all the robots discovery data:
 * 
 * You need UDP broadcast enabled in your network!
 * 
 * @example ```javascript
 * var dorita980 = require('dorita980');
 *
 * dorita980.discovery((ierr, data) => {
 *   console.log(data);
 * });
 * ```
 */
export function discovery(callback: (err: unknown, data: Omit<PublicInfo, 'blid'>) => void): void;
export function getRobotPublicInfo(ip: string, callback: (err: unknown, data: PublicInfo) => void): void;
export function getRobotByBlid(blid: string, callback: (err: unknown, data: PublicInfo) => void): void;
/** Fetches your robots from the cloud (you need your iRobot account credentials (email and password) )*/
export function getPasswordCloud(email: string, password: string, apiKey?: string): Promise<CloudDevice[]>;
export function getPassword(ip: string, firmwareVersion: '1'): Promise<{ blid: string, password: string; }>;
export function getPassword(ip: string): Promise<PublicInfo & { password: string; }>;
export interface CloudDevice {
  blid: string,
  password: string,
  sku: string,
  softwareVer: string,
  name: string,
  cap: Record<string, number>;
  svcDeplId: string,
  user_cert: boolean;
}
export interface PublicInfo {
  ver: '2' | '3',
  hostname: string,
  robotname: string,
  robotid: string;
  ip: string,
  mac: string,
  sw: string,
  sku: string,
  nc: number,
  proto: 'mqtt' | string;
  cap: Record<string, number>;
  blid: string;
}
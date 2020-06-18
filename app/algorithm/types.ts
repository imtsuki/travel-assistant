/**
 * 代表一座城市。
 *
 * @property name 城市名称
 * @property position 城市经纬度
 * @property risk 城市风险等级
 */
export interface City {
  name: string;
  position: { longitude: number; latitude: number };
  risk: string;
}

/**
 * 代表一条航线/车次。
 *
 * @property from 始发城市
 * @property to 到达城市
 * @property startTime 发车时间
 * @property endTime 到达时间
 * @property type 交通工具类型（飞机/火车/汽车）
 */
export interface Route {
  from: string;
  to: string;
  startTime: number;
  endTime: number;
  type: string;
}

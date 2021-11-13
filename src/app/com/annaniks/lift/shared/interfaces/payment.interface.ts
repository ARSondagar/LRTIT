import { IServiceBase } from "./tariff.interface";

export interface IPayment {
  userId: number;
  funds: number;
  currency: string;
  description: string;
}

export interface ISaveServices {
  userId: number;
  services: IServiceBase[];
  accounts: number;
  periods: number;
}

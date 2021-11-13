import { IAccount1, IPeriod, IService, IServiceBase } from './tariff.interface';

export interface IUserDetails {
  userId: number;
  amountAccounts: IAccount1;
  balance: number;
  debiting: number;
  services: IServiceBase[]
}


export interface IPostTariff {
  userId: number;           // Current User ID
//  description: string;      // Optional information
  services: IServiceBase[]; // Selected services,

  accounts: IAccount1;      // выбранное количество аккунтов
  periods: IPeriod;         // Выбранный период
//  autoDiscount: boolean;
}

export interface IAllServices {
  accounts: IAccount1[];
  periods: IPeriod[];
  services: IService[];
}

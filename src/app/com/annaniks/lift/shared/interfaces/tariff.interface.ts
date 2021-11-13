
export interface Itarif {
  amount: number;                     // Баланс текущего счета
  orderedServices: IorderedServices;  // Секция «Подключенные услуги»

//  accounts: number;                   // Количество аккаунтов (5 штук в примере)
  availableAccounts: IAccount[],      // Список возможных аккаунтов
  validUntil: string;                 // Срок действия услуг заканчивается; Date-time, ISO 8601 UTC (2021-06-11 20:06:17.001Z)
  promotions: Ipromotion[];           // Секция "Продвижение"
  discounts: Idiscount[];             // Секция "Период пользования"
  promo: IPromoCode;                  // Секция "Промо-код"
  history: ItransactionWeb[];  // Секции "Последние транзакции"; Ordered by date descending

  settings: {
    dailyDiscount: number;        // Величина ежедневного списания в рублях: (40 в примере)
    discountAll: number;          // Величина скидки в процентах при выборе всех продвижений (20 в примере)
    promotionsInColumn?: number;  // Количество строк в левом столбце (секция "Продвижение")
  }
}

export interface IorderedServices {   // Секция «Подключенные услуги»
  statistics: boolean;            // Статистика
  getSubscibers: boolean;         // Получение подписчиков
  increaseCoverage: boolean;      // Повышение охватов
  getActivity: boolean;           // Получение активности
  autoPosting: boolean;           // Автопостинг
  directAndMailing: boolean;      // Директ и рассылка
  deleteSubscibers: boolean;      // Удаление мертвых подписчиков
  getAccounts: boolean;           // Количество аккаунтов - 5шт.  (только флаг, количество в поле "accounts")
}

export interface IAccount {       // Строка в списке "возможные аккаунты"
  value: string,              // Количество аккаунтов (1, 5, 10, ...)
  text: string,               // Оглавление строки ("аккаунт", "аккаунтов", ...)
  isSelected?: boolean        // true --> услуга заказана
}

export interface Ipromotion {     // Строка в сеции "Продвижение"
  title: string,          // Оглавление ("Получение подписчиков", "Повышение охватов", ...)
  isChecked: boolean,     // true --> включено
  feeForMonth: number     // Плата за месяц
}

export interface Idiscount {    // Строка в секции "Период пользования"
  discount: number;         // Величина скидки в процентах
  period: number;           // Период заказа в днях
  accountNumber: number;    // Количество аккаунтов
  totalSumm: number;        // Сумма без скидки
  isChecked?: boolean;      // true --> включено
}

export interface IPromoCode {   // Секция "Промо-код"
  isChecked?: boolean;    // true --> включено
  value: string;          // Код
}

// export interface Itransaction {   // Строка в секции "Последние транзакции"
//   date: string;     // Date-time, ISO 8601 UTC (2021-06-11 20:06:17.001Z)
//   type: string;     // 'Поступления', 'Оплата услуг', ...
//   amount: number;   // Сумма
//   balance: number;  // Текущий баланс (остаток в счете клиента после операции)
// }

export interface IScrollValue {  // Горизонтал скролл в секции "Период пользования"
  value: number;      // Первый видимый элемент в массиве
  isActive: boolean;  // true --> включено
}

/*
export interface IcalculationState {
  selectedAccount: number;        // Выбранное число аккаунтов
  getSubscibers: boolean;         // Получение подписчиков
  increaseCoverage: boolean;      // Повышение охватов
  getActivity: boolean;           // Получение активности
  autoPosting: boolean;           // Автопостинг
  directAndMailing: boolean;      // Директ и рассылка
  deleteSubscibers: boolean;      // Удаление мертвых подписчиков
  selectedDiscountIndex: number;  // Индех выбранного периода
}
*/

/* ******************** Real interfaces ******************** */
export interface IServiceBase {
  id: number;
  name?: string;
  active: boolean;
  price?: number;
}
export interface IService extends IServiceBase {  // WEB format
  createdAt: string;  // UTC Date (2021-08-10T13:06:03.000Z)
  updatedAt: string;  // UTC Date (2021-08-10T13:07:17.797Z)
}
export interface IServiceLocal extends IServiceBase {
  createdAt: Date;  // Local DateTime
  updatedAt: Date;  // Local DateTime
  isOrdered: boolean;   // true => user selected this service
  feeForMonth: number;  // Price for days without discount
}

export interface IAccount1 {
  id: number;
  amountAccounts?: number;
  createdAt?: string;  // UTC Date (2021-08-10T13:06:03.000Z)
  updatedAt?: string;  // UTC Date (2021-08-11T12:42:53.119Z)
  discount?: number;
}
export interface IAccountLocal extends IAccount1 {
  isSelected: boolean;
  text: string;
  sAmount: string;
}

export interface IPeriod {
  id: number;
  discount?: number
  createdAt?: string;  // UTC Date (2021-08-10T13:06:03.000Z)
  updatedAt?: string;  // UTC Date (2021-08-11T12:42:53.119Z)
  days?: number;
}
export interface IPeriodLocal extends IPeriod {
  isSelected: boolean;
  accountNumber: number;          // Количество аккаунтов
  totalSumm: number;              // Summ for days without discount
  totalSummDiscounted?: number;   // Summ for days with discount
  totalSummNoDiscount?: number;   // Summ for days no discount
}

export interface IcalculationState {
  selectedAccount: number;          // Выбранное число аккаунтов
  userSelectedSvc: IServiceLocal[]; // Выбранные пользователем услуги
  selectedDiscountIndex: number;    // Индех выбранного периода
}

export interface ItransactionBase {   // Строка в секции "Последние транзакции"
  id: number;
  balance: number;      // Текущий баланс (остаток в счете клиента после операции)
  debiting: number;     // Сумма
  funcId: number;
  type: number;         // 1-4
  userId: number;
}
export interface ItransactionWeb extends ItransactionBase {
  createdAt: string;    // Date-time, ISO 8601 UTC (2021-06-11 20:06:17.001Z)
  updatedAt?: string;    // Date-time, ISO 8601 UTC (2021-08-20T15:48:50.026Z)
}
export interface ItransactionLocal extends ItransactionBase {
  createdAt: Date;    // Date-time, Local time from UTC (2021-06-11 20:06:17.001Z)
  updatedAt: Date;    // Date-time,Local time from UTC (2021-08-20T15:48:50.026Z)
  typeName: string;   // 'Поступления', 'Оплата услуг', ...
}

/* ******************** Testing data ******************** */
/*
export interface FakeData {
  services: IService[];
  orderedServices: number[],
  accounts: IAccount1[];
  selectedAccount: number;
  periods: IPeriod[];
  selectedPeriod: number;
}

export const testData: FakeData = {
  services: [
  {
    id: 1,
    name: 'Автоподписка',
    active: true,
    createdAt: '2021-08-10T13:06:03.000Z',
    updatedAt: '2021-08-10T13:07:17.797Z',
    price: 690
  },
  {
    id: 2,
    name: 'Просмотр сторис',
    active: true,
    createdAt: '2021-08-10T13:06:03.000Z',
    updatedAt: '2021-08-10T13:07:43.916Z',
    price: 490
  },
  {
    id: 3,
    name: 'Активность',
    active: true,
    createdAt: '2021-08-10T13:06:03.000Z',
    updatedAt: '2021-08-10T13:08:03.172Z',
    price: 790
  },
  {
    id: 4,
    name: 'Автопостинг',
    active: true,
    createdAt: '2021-08-10T13:06:03.000Z',
    updatedAt: '2021-08-10T13:08:24.188Z',
    price: 490
  },
  {
    id: 5,
    name: 'Директ',
    active: true,
    createdAt: '2021-08-10T13:06:03.000Z',
    updatedAt: '2021-08-10T13:08:42.228Z',
    price: 490
  },
  {
    id: 6,
    name: 'Отписка',
    active: true,
    createdAt: '2021-08-10T13:06:03.000Z',
    updatedAt: '2021-08-10T13:08:57.356Z',
    price: 290
  },
  {
    id: 7,
    name: 'Автоподписка',
    active: true,
    createdAt: '2021-08-10T13:10:00.000Z',
    updatedAt: '2021-08-10T13:10:44.596Z',
    price: 990
  }
],
orderedServices: [7, 3, 4, 5],

accounts: [
  {
    id: 1,
    amountAccounts: 1,
    createdAt: '2021-08-11T12:42:53.119Z',
    updatedAt: '2021-08-11T12:42:53.119Z',
    discount: 0
  },
  {
    id: 2,
    amountAccounts: 5,
    createdAt: '2021-08-11T12:42:57.208Z',
    updatedAt: '2021-08-11T12:42:57.208Z',
    discount: 5
  },
  {
    id: 3,
    amountAccounts: 10,
    createdAt: '2021-08-11T12:43:01.799Z',
    updatedAt: '2021-08-11T12:43:01.799Z',
    discount: 10
  },
  {
    id: 4,
    amountAccounts: 20,
    createdAt: '2021-08-11T12:43:04.095Z',
    updatedAt: '2021-08-11T12:43:04.095Z',
    discount: 15
  },
  {
    id: 5,
    amountAccounts: 30,
    createdAt: '2021-08-11T12:43:06.320Z',
    updatedAt: '2021-08-11T12:43:06.320Z',
    discount: 20
  },
  {
    id: 6,
    amountAccounts: 50,
    createdAt: '2021-08-11T12:43:08.856Z',
    updatedAt: '2021-08-11T12:43:08.856Z',
    discount: 25
  }
],
selectedAccount: 4,

periods: [
  {
    id: 1,
    discount: 0,
    createdAt: '2021-08-11T12:48:56.400Z',
    updatedAt: '2021-08-11T12:48:56.400Z',
    days: 30
  },
  {
    id: 2,
    discount: 10,
    createdAt: '2021-08-11T12:49:04.296Z',
    updatedAt: '2021-08-11T12:49:04.296Z',
    days: 90
  },
  {
    id: 3,
    discount: 20,
    createdAt: '2021-08-11T12:49:11.400Z',
    updatedAt: '2021-08-11T12:49:11.400Z',
    days: 180
  },
  {
    id: 4,
    discount: 30,
    createdAt: '2021-08-11T12:49:23.128Z',
    updatedAt: '2021-08-11T12:49:23.128Z',
    days: 365
  }
],
selectedPeriod: 3
}
*/

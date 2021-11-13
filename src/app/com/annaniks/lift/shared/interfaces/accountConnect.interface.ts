import { InstagramAccount } from './../../core/models/user';

export interface AccountConectInterface {
  code: number;
  data: {
    account: InstagramAccount
    challange: string;
    success: boolean;
  };
  message: string;
}

import {AccountManager} from "./AccountManager";
import {Sector} from "./Sector";

export interface AccountManagerSectorRelation {
  accountManagerId: number;
  accountManager: AccountManager;
  sectorId: number;
  sector: Sector;
  type: 'accountManagerSectorRelation';
}

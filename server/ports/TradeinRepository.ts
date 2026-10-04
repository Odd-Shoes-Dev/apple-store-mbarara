import { NewTradeinInput, TradeinRequest } from "../domain/types";

export interface TradeinRepository {
  create(input: NewTradeinInput): Promise<TradeinRequest>;
  list(): Promise<TradeinRequest[]>;
  getById(id: string): Promise<TradeinRequest | null>;
  updateStatus(id: string, status: TradeinRequest['status'], adminNote?: string | null): Promise<TradeinRequest>;
}

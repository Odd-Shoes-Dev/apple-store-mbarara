import { TradeinRepository } from "../ports/TradeinRepository";
import { NewTradeinInput, TradeinRequest } from "../domain/types";

export function createTradeinService(tradeinRepository: TradeinRepository) {
  return {
    submit(input: NewTradeinInput): Promise<TradeinRequest> {
      return tradeinRepository.create(input);
    },

    list(): Promise<TradeinRequest[]> {
      return tradeinRepository.list();
    },

    getById(id: string): Promise<TradeinRequest | null> {
      return tradeinRepository.getById(id);
    },

    updateStatus(id: string, status: TradeinRequest['status'], adminNote?: string | null): Promise<TradeinRequest> {
      return tradeinRepository.updateStatus(id, status, adminNote);
    },
  };
}

export type TradeinService = ReturnType<typeof createTradeinService>;

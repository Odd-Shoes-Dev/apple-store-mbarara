import { RepairRequestRepository } from "../ports/RepairRequestRepository";
import { NewRepairRequestInput, RepairRequest } from "../domain/types";

export function createRepairService(repairRequestRepository: RepairRequestRepository) {
  return {
    submit(input: NewRepairRequestInput): Promise<RepairRequest> {
      return repairRequestRepository.create(input);
    },

    list(): Promise<RepairRequest[]> {
      return repairRequestRepository.list();
    },

    getById(id: string): Promise<RepairRequest | null> {
      return repairRequestRepository.getById(id);
    },

    updateStatus(id: string, status: RepairRequest['status'], adminNote?: string | null): Promise<RepairRequest> {
      return repairRequestRepository.updateStatus(id, status, adminNote);
    },
  };
}

export type RepairService = ReturnType<typeof createRepairService>;

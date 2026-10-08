import { NewRepairRequestInput, RepairRequest } from "../domain/types";

export interface RepairRequestRepository {
  create(input: NewRepairRequestInput): Promise<RepairRequest>;
  list(): Promise<RepairRequest[]>;
  getById(id: string): Promise<RepairRequest | null>;
  updateStatus(id: string, status: RepairRequest['status'], adminNote?: string | null): Promise<RepairRequest>;
}

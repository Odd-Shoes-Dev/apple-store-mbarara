import { Subscriber } from "../domain/types";

export interface SubscriberRepository {
  subscribe(email: string): Promise<Subscriber>;
  list(): Promise<Subscriber[]>;
}

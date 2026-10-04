import { SubscriberRepository } from "../ports/SubscriberRepository";
import { Subscriber } from "../domain/types";

export function createSubscriberService(subscriberRepository: SubscriberRepository) {
  return {
    subscribe(email: string): Promise<Subscriber> {
      return subscriberRepository.subscribe(email);
    },

    list(): Promise<Subscriber[]> {
      return subscriberRepository.list();
    },
  };
}

export type SubscriberService = ReturnType<typeof createSubscriberService>;

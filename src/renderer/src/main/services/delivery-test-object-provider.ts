import { TestObjectProvider } from '@renderer/services/test-object-provider';
import { DeliveryDbFacade } from '@renderer/services/delivery-db-facade';

export const DeliveryTestObjectProvider = new TestObjectProvider(DeliveryDbFacade);

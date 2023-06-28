import { StoreGoodsService } from './store-goods-service';
import { StoreOrderService } from './store-order-service';

const goods: StoreGoodsService = StoreGoodsService.getInstance();
const order: StoreOrderService = StoreOrderService.getInstance();

export { goods, order };

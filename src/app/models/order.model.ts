import { CartItem } from './cart-item.model';
import { Customer } from './customer.model';

export class Order {
  constructor(
    public customer: Customer = null,
    public id: string = '',
    public items: CartItem[] = null,
    public total: number = null,
    public status: string = '',
    public number: string = '',
    public date: string = new Date().toISOString().split('T')[0],
    public shippingMethod: string = '',
    public shippingCost: number = 0,
    public paymentMethod: string = '',
    public surcharge: number = 0
  ) {}
}

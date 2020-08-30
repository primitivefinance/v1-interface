import { createContext } from "react";

import { OrderContextValues, OrderItem } from "./types";
import { EmptyAttributes } from "../Options/types";

const OrderContext = createContext<OrderContextValues>({
    item: EmptyAttributes,
    onAddItem: (item: OrderItem) => {},
    onChangeItem: (item: OrderItem) => {},
});

export default OrderContext;

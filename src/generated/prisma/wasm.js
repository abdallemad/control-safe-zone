
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.5.0
 * Query Engine version: 173f8d54f8d52e692c7e27e72a88314ec7aeff60
 */
Prisma.prismaVersion = {
  client: "6.5.0",
  engine: "173f8d54f8d52e692c7e27e72a88314ec7aeff60"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  clerkId: 'clerkId',
  email: 'email',
  fullName: 'fullName',
  phone: 'phone',
  companyName: 'companyName',
  role: 'role',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AddressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  recipientName: 'recipientName',
  phone: 'phone',
  shippingZoneId: 'shippingZoneId',
  city: 'city',
  street: 'street',
  building: 'building',
  floor: 'floor',
  apartment: 'apartment',
  landmark: 'landmark',
  isDefault: 'isDefault',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ShippingZoneScalarFieldEnum = {
  id: 'id',
  nameAr: 'nameAr',
  nameEn: 'nameEn',
  code: 'code',
  shippingFee: 'shippingFee',
  deliveryMinDays: 'deliveryMinDays',
  deliveryMaxDays: 'deliveryMaxDays',
  codAvailable: 'codAvailable',
  position: 'position',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BrandScalarFieldEnum = {
  id: 'id',
  name: 'name',
  nameAr: 'nameAr',
  slug: 'slug',
  logoUrl: 'logoUrl',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.VehicleModelScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  yearFrom: 'yearFrom',
  yearTo: 'yearTo',
  isActive: 'isActive',
  createdAt: 'createdAt',
  brandId: 'brandId'
};

exports.Prisma.ControllerPlatformScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  manufacturer: 'manufacturer',
  description: 'description',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  type: 'type',
  slug: 'slug',
  name: 'name',
  description: 'description',
  manufacturer: 'manufacturer',
  price: 'price',
  compareAtPrice: 'compareAtPrice',
  imageUrl: 'imageUrl',
  stockQuantity: 'stockQuantity',
  lowStockThreshold: 'lowStockThreshold',
  weightGrams: 'weightGrams',
  isFeatured: 'isFeatured',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductImageScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  url: 'url',
  position: 'position'
};

exports.Prisma.ProductVehicleScalarFieldEnum = {
  productId: 'productId',
  vehicleModelId: 'vehicleModelId',
  engine: 'engine'
};

exports.Prisma.IcDetailsScalarFieldEnum = {
  productId: 'productId',
  partNumber: 'partNumber',
  partNumberNormalized: 'partNumberNormalized',
  markings: 'markings',
  markingsNormalized: 'markingsNormalized',
  category: 'category',
  package: 'package',
  pinCount: 'pinCount',
  datasheetUrl: 'datasheetUrl'
};

exports.Prisma.IcPlatformScalarFieldEnum = {
  icId: 'icId',
  platformId: 'platformId',
  role: 'role'
};

exports.Prisma.ControllerDetailsScalarFieldEnum = {
  productId: 'productId',
  platformId: 'platformId',
  hardwareNumber: 'hardwareNumber',
  hardwareNumberNormalized: 'hardwareNumberNormalized',
  softwareNumber: 'softwareNumber',
  softwareNumberNormalized: 'softwareNumberNormalized',
  partNumber: 'partNumber',
  partNumberNormalized: 'partNumberNormalized',
  condition: 'condition',
  isVirgin: 'isVirgin',
  litres: 'litres',
  serialNumber: 'serialNumber'
};

exports.Prisma.ProgrammerDetailsScalarFieldEnum = {
  productId: 'productId',
  toolName: 'toolName',
  edition: 'edition',
  boxContents: 'boxContents'
};

exports.Prisma.ProgrammerSupportScalarFieldEnum = {
  programmerId: 'programmerId',
  platformId: 'platformId',
  obd: 'obd',
  boot: 'boot',
  bench: 'bench',
  notes: 'notes'
};

exports.Prisma.PinoutScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  platformId: 'platformId',
  connector: 'connector',
  imageUrl: 'imageUrl',
  pdfKey: 'pdfKey',
  requiresSignIn: 'requiresSignIn',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CartScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CartItemScalarFieldEnum = {
  id: 'id',
  cartId: 'cartId',
  productId: 'productId',
  quantity: 'quantity',
  createdAt: 'createdAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  orderNumber: 'orderNumber',
  userId: 'userId',
  status: 'status',
  paymentMethod: 'paymentMethod',
  subtotal: 'subtotal',
  shippingFee: 'shippingFee',
  codFee: 'codFee',
  total: 'total',
  shippingZoneId: 'shippingZoneId',
  shippingAddress: 'shippingAddress',
  customerPhone: 'customerPhone',
  customerNotes: 'customerNotes',
  adminNotes: 'adminNotes',
  carrier: 'carrier',
  trackingNumber: 'trackingNumber',
  confirmedAt: 'confirmedAt',
  shippedAt: 'shippedAt',
  deliveredAt: 'deliveredAt',
  cancelledAt: 'cancelledAt',
  cancelReason: 'cancelReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  productName: 'productName',
  productType: 'productType',
  productIdentifier: 'productIdentifier',
  unitPrice: 'unitPrice',
  quantity: 'quantity'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  provider: 'provider',
  method: 'method',
  status: 'status',
  amount: 'amount',
  currency: 'currency',
  providerOrderId: 'providerOrderId',
  transactionId: 'transactionId',
  rawPayload: 'rawPayload',
  paidAt: 'paidAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN'
};

exports.ProductType = exports.$Enums.ProductType = {
  IC: 'IC',
  CONTROLLER: 'CONTROLLER',
  PROGRAMMER: 'PROGRAMMER'
};

exports.IcCategory = exports.$Enums.IcCategory = {
  MCU: 'MCU',
  EEPROM: 'EEPROM',
  FLASH: 'FLASH',
  DRIVER: 'DRIVER',
  POWER: 'POWER',
  OTHER: 'OTHER'
};

exports.ProductCondition = exports.$Enums.ProductCondition = {
  NEW: 'NEW',
  USED: 'USED',
  REFURBISHED: 'REFURBISHED'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURNED: 'RETURNED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  CARD: 'CARD',
  WALLET: 'WALLET',
  COD: 'COD'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Address: 'Address',
  ShippingZone: 'ShippingZone',
  Brand: 'Brand',
  VehicleModel: 'VehicleModel',
  ControllerPlatform: 'ControllerPlatform',
  Product: 'Product',
  ProductImage: 'ProductImage',
  ProductVehicle: 'ProductVehicle',
  IcDetails: 'IcDetails',
  IcPlatform: 'IcPlatform',
  ControllerDetails: 'ControllerDetails',
  ProgrammerDetails: 'ProgrammerDetails',
  ProgrammerSupport: 'ProgrammerSupport',
  Pinout: 'Pinout',
  Cart: 'Cart',
  CartItem: 'CartItem',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Payment: 'Payment'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)

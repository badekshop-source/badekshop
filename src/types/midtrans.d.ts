// src/types/midtrans.d.ts
declare module 'midtrans-client' {
  export class Snap {
    constructor(options: any);
    createTransaction: (parameter: any) => Promise<any>;
  }

  export class CoreApi {
    constructor(options: any);
    transaction: {
      status: (orderId: string) => Promise<any>;
      approve: (orderId: string) => Promise<any>;
      cancel: (orderId: string) => Promise<any>;
    };
  }

  export default {
    Snap,
    CoreApi
  };
}
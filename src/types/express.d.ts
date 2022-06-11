// declare namespace Express {
//   interface User {
//     id: string;
//   }
// }

declare namespace Express {
  interface User {
    id: number;
    email: string;
    plaid_access_token: string;
  }
}

// declare global {
//   namespace Express {
//     interface Request {
//       body?: string;
//     }
//   }
// }

// declare global {
//   namespace http {
//     interface IncomingMessage {
//       context: Context;
//     }
//   }
// }

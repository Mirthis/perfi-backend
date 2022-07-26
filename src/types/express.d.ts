// declare namespace Express {
//   interface User {
//     id: string;
//   }
// }

declare namespace Express {
  interface User {
    id: number;
    email: string;
    password: string;
    isActive: boolean;
    isVerified: boolean;
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

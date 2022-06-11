declare module 'http' {
  interface IncomingMessage {
    body?: string;
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

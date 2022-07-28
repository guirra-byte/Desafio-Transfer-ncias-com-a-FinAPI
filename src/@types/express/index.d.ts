declare namespace Express {
  export interface Request {
    user: {
      id: string;
    },
    statement: {

      user_id: string,
      type: "DEPOSIT" | "WITHDRAW",
      amount: number,
      description: string
    }
  }
}

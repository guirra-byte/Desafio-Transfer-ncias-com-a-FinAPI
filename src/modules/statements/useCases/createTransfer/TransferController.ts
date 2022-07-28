import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { TransferUseCase } from "./TransferUseCase";

export class TransferController {

  async handle(request: Request, response: Response): Promise<Response> {

    const user_id = request.user.id;
    const { amount, description } = request.statement;
    const { sendToUserId } = request.body;

    try {

      const transferUseCase = container
        .resolve(TransferUseCase);

      transferUseCase
        .execute(user_id, sendToUserId, amount, description);

      return response
        .status(201)
        .send();
    }
    catch {

      return response
        .status(400)
        .send();
    }
  }
}

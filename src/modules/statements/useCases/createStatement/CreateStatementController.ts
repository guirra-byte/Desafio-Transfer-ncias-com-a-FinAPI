import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { STATEMENT } from '../../../../config/statement';

import { CreateStatementUseCase } from './CreateStatementUseCase';

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;

    const splittedPath = request.originalUrl.split('/')
    const type: STATEMENT = splittedPath[splittedPath.length - 1] as STATEMENT;

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      type,
      amount,
      description
    });

    request.statement = {
      amount: statement.amount,
      description: statement.description,
      type: statement.type,
      user_id: statement.user_id
    };

    return response.status(201).json(statement);
  }
}

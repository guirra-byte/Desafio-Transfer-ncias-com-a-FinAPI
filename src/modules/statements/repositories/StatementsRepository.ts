import { getRepository, Repository } from "typeorm";

import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

import { STATEMENT as OPERATION_STATEMENT } from '../../../config/statement';

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create({
    user_id,
    amount,
    description,
    type
  }: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create({
      user_id,
      amount,
      description,
      type
    });

    return this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.repository.findOne(statement_id, {
      where: { user_id }
    });
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    > {
    const statement = await this.repository.find({
      where: { user_id }
    });

    const balance = statement.reduce((acc, operation) => {
      if (operation.type === 'deposit') {
        return acc + operation.amount;
      } else {
        return acc - operation.amount;
      }
    }, 0)

    if (with_statement) {
      return {
        statement,
        balance
      }
    }

    return { balance }
  }

  async transfer(from_user_id: string, amount: number, transferDescription: string): Promise<void> {

    const { DEPOSIT } = OPERATION_STATEMENT;

    let userStatement = await this
      .repository
      .findOne({ user_id: from_user_id });

    if (!userStatement || !userStatement.user.id) {

      return undefined;
    }

    const { id } = userStatement.user;

    const statement = await this.create({
      user_id: id,
      amount: amount,
      type: DEPOSIT,
      description: transferDescription
    });

    userStatement.user.balance = (userStatement.user.balance - amount);
    userStatement.type = DEPOSIT;
    userStatement.description = transferDescription;

  }
}

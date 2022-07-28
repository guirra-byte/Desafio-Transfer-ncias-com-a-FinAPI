import { Statement } from "../../entities/Statement";
import { ICreateStatementDTO } from "../../useCases/createStatement/ICreateStatementDTO";
import { IGetBalanceDTO } from "../../useCases/getBalance/IGetBalanceDTO";
import { IGetStatementOperationDTO } from "../../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "../IStatementsRepository";

import { STATEMENT as OPERATION_STATEMENT } from '../../../../config/statement';

export class InMemoryStatementsRepository implements IStatementsRepository {
  private statements: Statement[] = [];

  async create(data: ICreateStatementDTO): Promise<Statement> {
    const statement = new Statement();

    Object.assign(statement, data);

    this.statements.push(statement);

    return statement;
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    return this.statements.find(operation => (
      operation.id === statement_id &&
      operation.user_id === user_id
    ));
  }

  async getUserBalance({ user_id, with_statement = false }: IGetBalanceDTO):
    Promise<
      { balance: number } | { balance: number, statement: Statement[] }
    > {
    const statement = this.statements.filter(operation => operation.user_id === user_id);

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

    const userIndex = await this
      .statements
      .findIndex(async (user) => user.id === from_user_id);

    const statementUser = await this.statements[userIndex];
    const { user } = statementUser;

    if (!user.id) {

      return undefined;
    }

    const statement = await this.create({
      user_id: user.id,
      amount: amount,
      type: DEPOSIT,
      description: transferDescription
    });

    user.balance = user.balance + amount;
    user.statement.push(statement);

    statementUser.type = DEPOSIT;
    statementUser.description = transferDescription;

  }
}

import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { AppError } from "../../../../shared/errors/AppError";

import { inject, injectable } from 'tsyringe';
import { USER_TRANSFER_BALANCE } from '../../../../config/statement';

@injectable()
export class TransferUseCase {

  constructor(
    @inject("StatementsRepository")
    private statementRepository: IStatementsRepository,

    @inject("UsersRepository")
    private userRepository: IUsersRepository) { }

  async execute(user_id: string, sendToUserId: string, amount: number, transferDescription: string): Promise<void> {

    const ensureSendToUserIdExists = await this
      .userRepository
      .findById(sendToUserId);

    const to = await this
      .userRepository
      .findById(user_id);

    if (!to) {

      throw new AppError("User does exists");
    }

    if (!ensureSendToUserIdExists || !ensureSendToUserIdExists.id) {

      return undefined;
    }

    const { balance } = to;
    const userHaveSuficientFounds: boolean = (amount < balance ? true : false);

    const { INSUFICIENT_FOUNDS } = USER_TRANSFER_BALANCE;

    if (userHaveSuficientFounds === false) {

      throw new AppError(`${INSUFICIENT_FOUNDS}`);
    }

    const removalForBalance = (balance - amount);
    to.balance = removalForBalance;

    await this
      .statementRepository
      .transfer(
        ensureSendToUserIdExists.id,
        amount,
        transferDescription);
  }
}

import { Router } from 'express';

import { CreateStatementController } from '../modules/statements/useCases/createStatement/CreateStatementController';
import { GetBalanceController } from '../modules/statements/useCases/getBalance/GetBalanceController';
import { GetStatementOperationController } from '../modules/statements/useCases/getStatementOperation/GetStatementOperationController';
import { TransferController } from '../modules/statements/useCases/createTransfer/TransferController';
import { ensureAuthenticated } from '../shared/infra/http/middlwares/ensureAuthenticated';

const statementRouter = Router();
const getBalanceController = new GetBalanceController();
const createStatementController = new CreateStatementController();
const getStatementOperationController = new GetStatementOperationController();
const transferController = new TransferController();

statementRouter.use(ensureAuthenticated);

statementRouter.get('/balance', getBalanceController.execute);
statementRouter.post('/deposit', createStatementController.execute, transferController.handle);
statementRouter.post('/withdraw', createStatementController.execute, transferController.handle);
statementRouter.post('transfer',)
statementRouter.get('/:statement_id', getStatementOperationController.execute);

export { statementRouter };

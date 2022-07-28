import { createConnection } from 'typeorm';

import { execSync } from 'child_process';
let yarnClientCli = '../../node_modules/.bin/typeorm';

(async () => await createConnection())()
  .then(() => {

    yarnClientCli = yarnClientCli.split('/')[4];
    execSync(`yarn ${yarnClientCli} migration:run`);

    console.log("O Postgres Database já está rodando!");
  });

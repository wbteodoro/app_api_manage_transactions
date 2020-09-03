import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const reducer = (type: string) => (
      accumulator: number,
      transaction: Transaction,
    ) => {
      if (transaction.type === type) {
        return accumulator + transaction.value;
      }
      return accumulator;
    };

    const incomeTotal = transactions.reduce(reducer('income'), 0);
    const outcomeTotal = transactions.reduce(reducer('outcome'), 0);

    return {
      income: incomeTotal,
      outcome: outcomeTotal,
      total: incomeTotal - outcomeTotal,
    };
  }
}

export default TransactionsRepository;

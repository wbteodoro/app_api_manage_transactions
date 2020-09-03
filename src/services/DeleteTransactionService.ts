import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Response {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Response): Promise<Transaction | undefined> {
    const transactionsRepository = getRepository(Transaction);

    const checkTransactionExists = transactionsRepository.findOne({
      where: { id },
    });

    if (!checkTransactionExists) {
      throw new AppError('Transação não identificada, ID inválido!');
    }

    await transactionsRepository.delete(id);

    return checkTransactionExists;
  }
}

export default DeleteTransactionService;

import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  fileName: string;
}

interface Response {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

interface FileLines {
  lines: Response[];
}

class ImportTransactionsService {
  async createAllTransactions({ lines }: FileLines): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const transactions: Transaction[] = [];
    for (const line of lines) {
      const { category, title, type, value } = line;
      const transaction = await createTransaction.execute({
        title,
        type: type as 'income' | 'outcome',
        value,
        category,
      });
      transactions.push(transaction);
    }
    return transactions;
  }

  public async execute({ fileName }: Request): Promise<Transaction[]> {
    const transactionsCsvFilePath = path.join(uploadConfig.directory, fileName);

    const readCSVStream = fs.createReadStream(transactionsCsvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: Response[] = [];

    parseCSV.on('data', row => {
      const [title, type, value, category] = row;
      lines.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const transactions = await this.createAllTransactions({ lines });

    await fs.promises.unlink(transactionsCsvFilePath);

    return transactions;
  }
}

export default ImportTransactionsService;

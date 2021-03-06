import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total)
      throw new AppError(
        "You don't have suficient balance to complete this action.",
        400,
      );

    const categoryFound = await categoriesRepository.findOne({
      where: { title: category },
    });

    let updatedCategoryId = '';

    if (!categoryFound) {
      const Createcategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(Createcategory);

      updatedCategoryId = Createcategory.id;
    } else {
      updatedCategoryId = categoryFound.id;
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: updatedCategoryId,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

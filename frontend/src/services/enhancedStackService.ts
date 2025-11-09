// frontend/src/services/enhancedStackService.ts
import { apiService, StackResponse } from './apiService';

export type Operation = '+' | '-' | '*' | '/' | 'sqrt' | 'pow' | 'swap' | 'dup' | 'drop';

export async function perform(operation: Operation): Promise<StackResponse> {
  switch (operation) {
    case '+':
      return apiService.op('add');
    case '-':
      return apiService.op('sub');
    case '*':
      return apiService.op('mul');
    case '/':
      return apiService.op('div');
    case 'sqrt':
      return apiService.adv('sqrt');
    case 'pow':
      // backend expose /op/pow et /op/power -> choisissons 'pow'
      return apiService.adv('pow');
    case 'swap':
      return apiService.adv('swap');
    case 'dup':
      return apiService.adv('dup');
    case 'drop':
      return apiService.adv('drop');
    default:
      // ne devrait jamais arriver
      throw new Error('Opération inconnue');
  }
}

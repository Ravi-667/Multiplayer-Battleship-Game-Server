import inquirer from 'inquirer';
import { SHIP_TYPES, ORIENTATION } from '../../shared/constants.js';

export const askForOrientation = async () => {
  const { orientation } = await inquirer.prompt([
    {
      type: 'list',
      name: 'orientation',
      message: 'Choose orientation:',
      choices: [
        { name: 'Horizontal', value: ORIENTATION.HORIZONTAL },
        { name: 'Vertical', value: ORIENTATION.VERTICAL },
      ],
    },
  ]);
  return orientation;
};

export const askForCoordinates = async (message = 'Enter coordinates (x y):') => {
    const { input } = await inquirer.prompt([
        {
            type: 'input',
            name: 'input',
            message,
            validate: (value) => {
                const parts = value.trim().split(/\s+/);
                if (parts.length !== 2) return 'Please enter two numbers separated by space (e.g. "0 0")';
                const [x, y] = parts.map(Number);
                if (isNaN(x) || isNaN(y)) return 'Coordinates must be numbers';
                if (x < 0 || x > 9 || y < 0 || y > 9) return 'Coordinates must be between 0 and 9';
                return true;
            }
        }
    ]);
    const [x, y] = input.trim().split(/\s+/).map(Number);
    return { x, y };
};

export const askMainMenu = async () => {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                { name: 'Join Game', value: 'JOIN' },
                { name: 'Exit', value: 'EXIT' }
            ]
        }
    ]);
    return action;
};

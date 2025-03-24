import { FaPlusMinus, FaPercent, FaDivide, FaXmark, FaEquals, FaPlus, FaMinus } from 'react-icons/fa6';
import { TbXPowerY } from 'react-icons/tb';

export enum FunctionalOperator {
	plus = '+',
	minus = '_',
	mult = '*',
	div = '/',
	pow = '^',
} // minus is marked as underscore to enable calculations on negative numbers

export enum GeneralOperator {
	inverse = '-',
	equals = '=',
}

export interface Operation {
	value: number;
	operator: FunctionalOperator;
}

export function isGeneralOperator(n: string): boolean {
	return n === '*' || n === '/' || n === '_' || n === '+' || n === '^' || n === '-';
}

export function isFunctionalOperator(n: string): boolean {
	return n === '*' || n === '/' || n === '_' || n === '+' || n === '^';
}

export function convertToOnp(n: string): string {
	let output = '';
	const s: string[] = []; // Stack for operators

	for (let i = 0; i < n.length; i++) {
		let looped = false;
		if (/[a-zA-Z]/.test(n[i])) {
			output += n[i] + ' '; // If not an operator, add to output
		} else if (/[0-9.-]/.test(n[i])) {
			let temp = '';
			let hasDecimal = false;

			while (i < n.length && (/[0-9-]/.test(n[i]) || (n[i] === '.' && !hasDecimal))) {
				if (n[i] === '.') hasDecimal = true;
				temp += n[i];
				i++;
			}
			i--; // Move back to correctly handle loop increment
			output += temp + ' ';
		} else if (s.length > 0) {
			while (
				s.length > 0 &&
				(((n[i] === '_' || n[i] === '+') && (s[s.length - 1] === '_' || s[s.length - 1] === '+')) ||
					((n[i] === '_' || n[i] === '+') && (s[s.length - 1] === '*' || s[s.length - 1] === '/')) ||
					((n[i] === '*' || n[i] === '/') && (s[s.length - 1] === '*' || s[s.length - 1] === '/')) ||
					((n[i] === '_' || n[i] === '+' || n[i] === '*' || n[i] === '/') && s[s.length - 1] === '^'))
			) {
				output += s.pop() + ' ';
				looped = true;
			}

			if (looped) {
				s.push(n[i]);
				looped = false;
				continue;
			}

			if (
				((n[i] === '*' || n[i] === '/') && (s[s.length - 1] === '_' || s[s.length - 1] === '+')) ||
				n[i] === '^' ||
				n[i] === '(' ||
				s[s.length - 1] === '('
			) {
				s.push(n[i]);
			} else if (n[i] === ')') {
				while (s[s.length - 1] !== '(') {
					output += s.pop() + ' ';
				}
				s.pop();
			}
		} else {
			s.push(n[i]);
		}

		if (i === n.length - 1) {
			while (s.length > 0) {
				output += s.pop() + ' ';
			}
		}
	}

	return output.trim();
}

export function calculateFromOnp(n: string): number {
	const s: number[] = [];

	for (let i = 0; i < n.length; i++) {
		if (n[i] === ' ') continue;

		if (isFunctionalOperator(n[i])) {
			const n1 = s.pop()!;
			const n2 = s.pop()!;
			switch (n[i]) {
				case '*':
					s.push(n2 * n1);
					break;
				case '/':
					s.push(n2 / n1);
					break;
				case '_':
					s.push(n2 - n1);
					break;
				case '+':
					s.push(n2 + n1);
					break;
				case '^':
					s.push(Math.pow(n2, n1));
					break;
			}
		} else if (/[0-9.-]/.test(n[i])) {
			let temp = '';
			while (i < n.length && /[0-9.-]/.test(n[i])) {
				temp += n[i];
				i++;
			}
			i--;
			s.push(parseFloat(temp));
		} else if (/[a-zA-Z]/.test(n[i])) {
			// not possible in our case
			// return null; // If expression contains a variable, return null
		} else {
			s.push(parseFloat(n[i]));
		}
	}
	return s.pop()!;
}

export function getIconForOperator(operator: FunctionalOperator | GeneralOperator) {
	switch (operator) {
		case FunctionalOperator.plus:
			return <FaPlus size={25} />;

		case FunctionalOperator.pow:
			return <TbXPowerY />;

		case FunctionalOperator.minus:
			return <FaMinus size={25} />;

		case GeneralOperator.equals:
			return <FaEquals size={25} />;

		case FunctionalOperator.mult:
			return <FaXmark size={25} />;

		case FunctionalOperator.div:
			return <FaDivide size={25} />;

		default:
			return null;
	}
}

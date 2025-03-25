import React, { useEffect, useState } from 'react';
import { FaDivide, FaPercent, FaPlus, FaPlusMinus } from 'react-icons/fa6';
import { FaMinus } from 'react-icons/fa6';
import { FaXmark } from 'react-icons/fa6';
import { FaEquals } from 'react-icons/fa6';
import {
	calculateFromOnp,
	convertToOnp,
	getIconForOperator,
	isFunctionalOperator,
	Operation,
	FunctionalOperator,
	isGeneralOperator,
	GeneralOperator,
} from './globals';
import { TbXPowerY } from 'react-icons/tb';
import { IoBackspaceOutline } from 'react-icons/io5';

interface HistoricalOperation {
	operations: Operation[];
	value: number;
	equationString: string;
}

function App() {
	const [displayString, setDisplayString] = useState<string>('0');

	const [equationString, setEquationString] = useState<string>('');

	// this will tell us if we need to reset the display string as after pressing an operator
	// we are going to be taking a new value - the previous one should be overriden
	const [newEquationVar, setNewEquationVar] = useState<boolean>(true);

	const [operations, setOperations] = useState<Operation[]>([]);

	// in previous calculations
	const [historicalOperations, setHistoricalOperations] = useState<HistoricalOperation[]>([]);

	const [lastCalculatedValue, setLastCalculatedValue] = useState<{ value: number; equationStr: string }>({
		value: 0,
		equationStr: '',
	});

	const [newEquationTrigger, setNewEquationTrigger] = useState<number>(0);

	useEffect(() => {
		const resNeeded: boolean = equationString.endsWith(GeneralOperator.equals);
		if (!resNeeded || !operations.length || !equationString.length) return;

		const onpEquation: string = convertToOnp(equationString.substring(0, equationString.length - 1));
		console.log('onp equation:', onpEquation);
		const value: number = restrictDigitsAfterDecimalPoint(calculateFromOnp(onpEquation)?.toString()) as number;

		if (isNaN(value)) {
			setDisplayString('NaN');
			setEquationString('');
			return;
		}

		setDisplayString(value.toString());
		setNewEquationVar(false);
		setLastCalculatedValue({
			value: value,
			equationStr: equationString + value.toString(),
		});
		setEquationString((prev) => prev + value.toString());
	}, [operations]);

	useEffect(() => {
		mapEquationStringSteps(equationString);
	}, [equationString]);

	function mapEquationStringSteps(str: string) {
		const t: Operation[] = [];

		for (let i = 0; str.length; i++) {
			let num = '';
			while (str[i] && !isFunctionalOperator(str[i]) && str[i] !== GeneralOperator.equals) {
				num += str[i++];
			}

			if (!str[i]) break;
			const oper: FunctionalOperator = str[i] as FunctionalOperator; // after the number there must be an operator that we assign to that number

			t.unshift({
				value: parseFloat(num),
				operator: oper,
			});
		}
		console.log('mapping: ', t);

		setOperations(t);
	}

	useEffect(() => {
		if (lastCalculatedValue.equationStr.length)
			setHistoricalOperations([
				...historicalOperations,
				{
					operations: operations,
					value: lastCalculatedValue?.value,
					equationString: lastCalculatedValue?.equationStr.replace('-', '_'),
				},
			]);
	}, [newEquationTrigger]);

	function reset() {
		if (equationString.length && operations.length) setNewEquationTrigger(new Date().getTime());

		setDisplayString('0');
		setEquationString('');
	}

	function displayEquationString(eqStr: string) {
		let s: string = '';
		for (let i = 0; i < eqStr.length; i++) {
			if (eqStr[0] === FunctionalOperator.minus && i === 0) {
				s += '-';
			} else if (isFunctionalOperator(eqStr[i]) || eqStr[i] === GeneralOperator.equals) {
				s += ' ' + eqStr[i].replace(FunctionalOperator.minus, '-').replace(FunctionalOperator.mult, 'x') + ' '; // we separate numbers from operators
			} else {
				s += eqStr[i];
			}
		}
		return s;
	}

	function handleOperatorClick(operator: FunctionalOperator | GeneralOperator) {
		let x: string = equationString;
		let newEquation: boolean = false;

		if (equationString.includes(GeneralOperator.equals)) {
			x = equationString.substring(equationString.indexOf(GeneralOperator.equals) + 1, equationString.length);
			newEquation = true;
			setNewEquationTrigger(new Date().getTime());
		}

		setNewEquationVar(true);

		let operatorsFromEndCount: number = 0;
		for (let i = x.length - 1; i >= 0; i--) {
			if (isGeneralOperator(x[i])) operatorsFromEndCount++;
			else break;
		}

		if (newEquation) {
			setEquationString(x + operator);
			return;
		}

		// if it ends with an operator we need to replace it
		if (isGeneralOperator(x[x.length - 1]) || (isGeneralOperator(x[x.length - 1]) && x[x.length - 2])) {
			setEquationString((!x.length ? '' : x.substring(0, x.length - operatorsFromEndCount)) + operator);
		} else {
			setEquationString((!x.length || newEquationVar ? '' : x) + operator);
		}
	}

	function handleNumberClick(label: string) {
		if (equationString.includes(GeneralOperator.equals)) {
			setEquationString(displayString + label);
			setDisplayString(displayString + label);
			setNewEquationTrigger(new Date().getTime());
		} else {
			setDisplayString((prev) => ((prev === '0' || newEquationVar) && label !== '.' ? '' : prev) + label);

			if (label === '.') {
				setEquationString((prev) => {
					const end = prev.slice(-1);
					if (!/\d$/.test(end)) {
						return prev + '0.';
					}
					return prev + '.';
				});
			} else {
				setEquationString((prev) => (prev === '0' ? '' : prev) + label);
			}
		}

		setNewEquationVar(false);
	}

	function restrictDigitsAfterDecimalPoint(str: string) {
		return (
			Number(
				parseFloat(str)
					.toFixed(8)
					.replace(/\.?0+$/, '')
			) || str
		);
	}

	function clearCurrentHistory() {
		setHistoricalOperations([]);
	}

	function handleBackspace() {
		if (equationString.includes(GeneralOperator.equals)) return;

		if (!equationString.substring(0, equationString.length - 1)) {
			reset();

			return;
		}
		setDisplayString(displayString.substring(0, displayString.length - 1) || '0');
		setEquationString(equationString.substring(0, equationString.length - 1));
	}

	return (
		<div className="flex w-[90%] mx-auto min-h-[100vh] mt-20">
			<div className="relative gap-10 flex flex-col">
				<div className="max-w-[500px] w-full bg-[#484f50] rounded-lg px-5 py-10 border-[2px] border-cyan-300 calc-holder h-fit">
					<div className="bg-gray-800 rounded-lg shadow-xl px-4 py-2 text-cyan-300 font-medium text-4xl text-end tracking-wide whitespace-nowrap border-2 border-gray-600">
						<div className="flex flex-col gap-2 overflow-x-auto">
							<span className="w-full">{restrictDigitsAfterDecimalPoint(displayString)}</span>
							<span className="text-white opacity-50 text-xl w-full">{displayEquationString(equationString) || '0'}</span>
						</div>
					</div>
					<div className="buttons-holder mt-10">
						<div className="text-white bg-cyan-900" onClick={reset}>
							<span>C</span>
						</div>
						<div className="text-white bg-cyan-900" onClick={handleBackspace}>
							<span>
								<IoBackspaceOutline size={40} />
							</span>
						</div>
						<div
							className="text-white bg-cyan-900"
							onClick={() => {
								handleOperatorClick(FunctionalOperator.pow);
							}}>
							<span>
								<TbXPowerY />
							</span>
						</div>

						<div
							className="text-cyan-300 bg-gray-600"
							onClick={() => {
								handleOperatorClick(FunctionalOperator.div);
							}}>
							<span>
								<FaDivide size={25} />
							</span>
						</div>
						<div
							className="text-cyan-300 bg-gray-800"
							onClick={() => {
								handleNumberClick('7');
							}}>
							<span>7</span>
						</div>
						<div
							className="text-cyan-300 bg-gray-800"
							onClick={() => {
								handleNumberClick('8');
							}}>
							<span>8</span>
						</div>
						<div
							className="text-cyan-300 bg-gray-800"
							onClick={() => {
								handleNumberClick('9');
							}}>
							<span>9</span>
						</div>
						<div
							className="text-cyan-300 bg-gray-600"
							onClick={() => {
								handleOperatorClick(FunctionalOperator.mult);
							}}>
							<span>
								<FaXmark size={25} />
							</span>
						</div>
						<div
							className="text-cyan-300 bg-gray-800"
							onClick={() => {
								handleNumberClick('4');
							}}>
							<span>4</span>
						</div>
						<div
							className="text-cyan-300 bg-gray-800"
							onClick={() => {
								handleNumberClick('5');
							}}>
							<span>5</span>
						</div>
						<div
							className="text-cyan-300 bg-gray-800"
							onClick={() => {
								handleNumberClick('6');
							}}>
							<span>6</span>
						</div>
						<div
							className="text-cyan-300 bg-gray-600"
							onClick={() => {
								const end = equationString[equationString.length - 1];

								if (end === FunctionalOperator.minus || end === '-') return;

								if (equationString.includes(GeneralOperator.equals)) {
									console.log(equationString.substring(equationString.indexOf('=') + 1, equationString.length), equationString);
									setEquationString(equationString.substring(equationString.indexOf('=') + 1, equationString.length));
								}

								const treatAsInversion: FunctionalOperator[] = [FunctionalOperator.div, FunctionalOperator.mult];
								// in case of a minus we need to replace only if it ends with a + or a -
								// if it ends with multiplication or division we need to treat it not as subtraction but as a sign change
								if (treatAsInversion.includes(end as FunctionalOperator) || !equationString.length || newEquationVar) {
									handleNumberClick('-');
								} else {
									handleOperatorClick(FunctionalOperator.minus);
								}
							}}>
							<span>
								<FaMinus size={25} />
							</span>
						</div>

						<div
							className="text-cyan-300 bg-gray-800"
							onClick={() => {
								handleNumberClick('1');
							}}>
							<span>1</span>
						</div>

						<div
							className="text-cyan-300 bg-gray-800"
							onClick={() => {
								handleNumberClick('2');
							}}>
							<span>2</span>
						</div>
						<div
							className="text-cyan-300 bg-gray-800"
							onClick={() => {
								handleNumberClick('3');
							}}>
							<span>3</span>
						</div>
						<div
							className="text-cyan-300  bg-gray-600"
							onClick={() => {
								handleOperatorClick(FunctionalOperator.plus);
							}}>
							<span>
								<FaPlus size={25} />
							</span>
						</div>
						<div
							className="!w-full col-span-2 text-cyan-300 bg-gray-800"
							onClick={() => {
								handleNumberClick('0');
							}}>
							<span>0</span>
						</div>
						<div
							className="text-cyan-300 bg-gray-800"
							onClick={() => {
								if (displayString.includes('.')) return;

								handleNumberClick('.');
							}}>
							<span>.</span>
						</div>
						<div
							className="text-cyan-300 bg-gray-600"
							onClick={() => {
								handleOperatorClick(GeneralOperator.equals);
							}}>
							<span>
								<FaEquals size={25} />
							</span>
						</div>
					</div>
				</div>
				<div
					className={`operation-displayer bg-gray-800 absolute left-[530px] rounded-lg top-0 text-cyan-300 w-[400px] max-w-[500px] py-4 px-6 flex flex-col max-h-[600px] overflow-y-auto
						${historicalOperations.length || operations.length ? 'active' : ''}
					`}>
					<div className="flex items-center justify-between border-b-cyan-300 border-b-2 mb-5 pb-2 ">
						<span className="font-medium tracking-wide text-white text-xl">History: </span>
						<div className="cursor-pointer px-2 py-1 border border-cyan-300 rounded-md" onClick={clearCurrentHistory}>
							clear
						</div>
					</div>
					<ul className={`flex flex-col gap-2} ${operations.length ? 'mb-10' : ''}`}>
						{operations.map((x: Operation, index: number) => {
							return (
								<li className="flex items-center text-2xl" key={'operation' + index}>
									{x.value} <span className="ml-auto">{getIconForOperator(x.operator)}</span>
								</li>
							);
						})}
					</ul>
					{[...historicalOperations].reverse().map((x: HistoricalOperation, index: number) => {
						console.log(x);
						return (
							<div className="flex text-xl flex-col mb-10 gap-3 bg-[#1d2020] px-3 py-2 rounded-lg" key={'historical-operation' + index}>
								<span className="text-white opacity-50">{displayEquationString(x.equationString)}</span>
								<ul className="flex flex-col gap-2">
									{x.operations.map((a: Operation) => {
										return (
											<li className="flex items-center text-2xl">
												{a.value} <span className="ml-auto">{getIconForOperator(a.operator)}</span>
											</li>
										);
									})}
								</ul>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default App;

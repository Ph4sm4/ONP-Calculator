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
} from './globals';

interface HistoricalOperation {
	id: number;
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

	// in previous calculations
	const [historicalOperations, setHistoricalOperations] = useState<HistoricalOperation[]>([]);

	useEffect(() => {
		const resNeeded: boolean = equationString.endsWith(FunctionalOperator.equals);
		if (!resNeeded) return;

		const onpEquation: string = convertToOnp(equationString.substring(0, equationString.length - 1));
		console.log('onp equation:', onpEquation);
		const value: number = calculateFromOnp(onpEquation);

		if (isNaN(value)) {
			setDisplayString('NaN');
			setEquationString('');
			return;
		}

		// setHistoricalOperations([
		// 	...historicalOperations,
		// 	{ id: historicalOperations.length + 1, operations: operations, value: value, equationString: equationString.replace('-', '_') },
		// ]);
		setDisplayString(value.toString());
		setEquationString((prev) => prev + value.toString());
		setNewEquationVar(false);
	}, [equationString]);

	function reset() {
		setDisplayString('0');
		setEquationString('');
		setHistoricalOperations([]);
	}

	function displayEquationString(eqStr: string) {
		let s: string = '';
		for (let i = 0; i < eqStr.length; i++) {
			if (eqStr[0] === FunctionalOperator.minus && i === 0) {
				s += '-';
			} else if (isFunctionalOperator(eqStr[i])) {
				s += ' ' + eqStr[i].replace(FunctionalOperator.minus, '-').replace(FunctionalOperator.mult, 'x') + ' '; // we separate numbers from operators
			} else {
				s += eqStr[i];
			}
		}
		return s;
	}

	function handleOperatorClick(operator: FunctionalOperator) {
		let x: string = equationString;
		let newEquation: boolean = false;

		if (equationString.includes(FunctionalOperator.equals)) {
			x = equationString.substring(equationString.indexOf('=') + 1, equationString.length);
			newEquation = true;
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
		if (equationString.includes(FunctionalOperator.equals)) {
			setEquationString(displayString + label);
			setDisplayString(displayString + label);
		} else {
			setDisplayString((prev) => (prev === '0' || newEquationVar ? '' : prev) + label);
			setEquationString((prev) => (prev === '0' ? '' : prev) + label);
		}

		setNewEquationVar(false);
	}

	return (
		<div className="flex w-[80%] mx-auto min-h-[100vh] mt-20 justify-center">
			<div className="w-[400px] h-[50%] bg-[#484f50] rounded-lg px-5 py-10 border-[2px] border-cyan-300 calc-holder relative">
				<div className="bg-gray-800 rounded-lg shadow-lg px-4 py-2 text-cyan-300 font-medium text-4xl text-end tracking-wide whitespace-nowrap">
					<div className="flex flex-col gap-2 overflow-x-auto">
						<span className="w-full">{displayString || '0'}</span>
						<span className="text-white opacity-50 text-xl w-full">{displayEquationString(equationString)}</span>
					</div>
				</div>
				<div
					className={`operation-displayer bg-gray-800 absolute right-[-330px] rounded-lg top-0 text-cyan-300 w-[300px] py-4 px-2 flex flex-col max-h-[100%] overflow-y-auto
						${equationString.length || historicalOperations.length ? 'active' : ''}
					`}>
					<span className="font-medium tracking-wide text-white border-b-2 mb-5 pb-2 border-b-cyan-300">History: </span>
					<ul className="flex flex-col gap-2">
						{/* {operations.map((x: Operation, index: number) => {
							return (
								<li className="flex items-center text-2xl">
									{x.value} <span className="ml-auto">{getIconForOperator(x.operator)}</span>
								</li>
							);
						})} */}
					</ul>
					{[...historicalOperations].reverse().map((x: HistoricalOperation) => {
						return (
							<div className="flex text-xl flex-col mt-10 gap-3">
								<span className="font-medium text-white px-3 py-1 border rounded-md">
									result = <i>{x.value}</i>
								</span>
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
				<div className="buttons-holder mt-10">
					<div className="text-white bg-cyan-900" onClick={reset}>
						<span>C</span>
					</div>
					<div className="text-white bg-cyan-900">
						<span>
							<FaPlusMinus size={25} />
						</span>
					</div>
					<div className="text-white bg-cyan-900">
						<span>
							<FaPercent size={25} />
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

							if (equationString.includes(FunctionalOperator.equals)) {
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
							handleOperatorClick(FunctionalOperator.equals);
						}}>
						<span>
							<FaEquals size={25} />
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;

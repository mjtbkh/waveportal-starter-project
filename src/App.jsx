import React, { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from '../utils/WavePortal.json';
import { v4 as uuid4 } from 'uuid';

export default function App() {
	const [currentAccount, setCurrentAccount] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);
	const [totalWaves, setTotalWaves] = useState(0);
	const [allWaves, setAllWaves] = useState([]);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	const v4options = {
		random: [
			0x10, 0x91, 0x56, 0xbe, 0xc4, 0xfb, 0xc1, 0xea, 0x71, 0xb4, 0xef, 0xe1, 0x67, 0x1c, 0x58, 0x36,
		],
	};

	const generateId = useCallback(() => uuid4(v4options.random.push(new Date().getMilliseconds)), [])

	const contractAddress = '0x4Cc64ea707B249D7bdaB59141C6A10680938562d';
	const contractABI = abi.abi;

	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Make sure you have Metamask!');
				return;
			} else console.log('We have the ethereum object', ethereum);

			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				setCurrentAccount(account);
				console.log('Found an authorized account: ', account);
			} else console.log('No authorized account found');
		} catch (e) {
			console.log(e);
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get Metamsak');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts',
			});
			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (e) {
			console.log(e);
		}
	};

	const getTotalWaves = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				await wavePortalContract
					.getTotalWaves()
					.then((waves) =>
						setTotalWaves(ethers.BigNumber.from(waves).toString())
					);
			}
		} catch (e) {
			console.log(e);
		}
	};

	const getAllWaves = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let wavesCleaned = [];

				const waves = await wavePortalContract.getAllWaves();

				waves.forEach((wave) =>
					wavesCleaned.push({
						address: wave.waver,
						message: wave.message,
						timestamp: new Date(wave.timestamp * 1000),
					})
				);

				setAllWaves(wavesCleaned);
			} else console.log("ethereum object doesn't exist!");
		} catch (e) {
			console.log(e);
		}
	};

	const wave = async () => {
		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());

				/*
				 * Execute the actual wave from your smart contract
				 */
				setIsProcessing(true);
				const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
				console.log('Mining...', waveTxn.hash);

				await waveTxn.wait();
				console.log('Mined -- ', waveTxn.hash);

				count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());
				setTotalWaves(count.toNumber());
				setIsProcessing(false);
			} else console.log("Ethereum object doesn't exist!");
		} catch (error) {
			console.log({ error });
			setIsProcessing(false);
			setError(error);
			setTimeout(() => setError(''), 6000)
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
		getTotalWaves();
		getAllWaves();
	}, [totalWaves, currentAccount]);

	return (
		<div className="mainContainer">
			{error &&
				<div className="errorContainer">
					<p>{error}</p>
				</div>
			}
			<div className="dataContainer">
				{isProcessing && (
					<div className="spinner">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							/>
						</svg>
						Waiting for transaction to be approved...
          </div>
				)}
				<div className="header">👋 Hey there!</div>

				<div className="bio">
					This is waveportal, where you can wave to others on blockchain
          <br />
					Say hello, gm, gn...
        </div>

				<div className="counter">
					Total waves up to now:{' '}
					<span style={{ textDecoration: 'underline' }}>{totalWaves}</span>
				</div>
				<input
					type="text"
					onChange={(e) => setMessage(e.target.value)}
					placeholder="your message..."
				/>
				<button className="waveButton" onClick={wave}>
					Wave at Others
        </button>
				{currentAccount && (
					<button className="address">current wallet: {currentAccount}</button>
				)}

				{!currentAccount && (
					<button className="waveButton" onClick={connectWallet}>
						Connect Wallet
          </button>
				)}
			</div>

			<div style={{ display: 'flex', flexFlow: 'column-reverse', gap: '20px' }}>
				{allWaves &&
					allWaves.map((wave) => (
						<div className="dataContainer" key={generateId()}>
							<p>
								<b>from:</b> {wave.address}
							</p>
							<p>
								<b>message:</b> {wave.message}
							</p>
							<p>
								<b>at:</b> {wave.timestamp.toString()}
							</p>
						</div>
					))}
			</div>

		</div>
	);
}

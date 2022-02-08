import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import abi from '../Utils/WavePortal.json';

export default function App() {
	const [currentAccount, setCurrentAccount] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);
	const [totalWaves, setTotalWaves] = useState(0);
	const contractAddress = '0xd1b7c7faf9e9e01b5c7287dd0d8013f88e1b7681';
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
			const { ethreum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				await wavePortalContract.getTotalWaves()
				.then(waves => setTotalWaves(ethers.BigNumber.from(waves).toString()))
			}
		} catch (e) {
			console.log(e);
		}
	}

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
				const waveTxn = await wavePortalContract.wave();
				console.log('Mining...', waveTxn.hash);

				await waveTxn.wait();
				console.log('Mined -- ', waveTxn.hash);

				count = await wavePortalContract.getTotalWaves();
				console.log('Retrieved total wave count...', count.toNumber());
				setTotalWaves(count.toNumber())
				setIsProcessing(false);
			} else console.log("Ethereum object doesn't exist!");
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
		getTotalWaves();
	}, [totalWaves, currentAccount]);

	return (
		<div className="mainContainer">
			<div className="dataContainer">
				{isProcessing && <div className="spinner">
				<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				Waiting for transaction to be approved...
				</div>}
				<div className="header">👋 Hey there!</div>

				<div className="bio">
					I am Mojtaba and I'm gonna create some web3 stuff here!
          <br />
					This is waveportal, where you can wave to others on blockchain
          <br />
					<b>Try now, it's free!</b>
				</div>

				<div className="counter">
					Total waves up to now:{' '}
					<span style={{ textDecoration: 'underline' }}>{totalWaves}</span>
				</div>
				<button className="waveButton" onClick={wave}>
					Wave at Others
        </button>
				{currentAccount && <button>{currentAccount}</button>}

				{!currentAccount && (
					<button className="waveButton" onClick={connectWallet}>
						Connect Wallet
          </button>
				)}
			</div>
		</div>
	);
}

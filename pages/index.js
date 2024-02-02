import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState("0"); // Initialize balance as string
  const [roomType, setRoomType] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  useEffect(() => {
    getWallet();
  }, []);

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts[0]);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts[0]);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const balanceWei = await atm.getBalance();
      const balanceEther = ethers.utils.formatEther(balanceWei);
      setBalance(balanceEther); // Set balance in ether
    }
  };
  

  const bookRoom = async () => {
    if (atm && roomType !== "") {
      let tx;
      if (roomType === "deluxe") {
        tx = await atm.bookRoom("deluxe", { value: ethers.utils.parseEther("2") });
      } else if (roomType === "premium") {
        tx = await atm.bookRoom("premium", { value: ethers.utils.parseEther("1.2") });
      } else if (roomType === "basic") {
        tx = await atm.bookRoom("basic", { value: ethers.utils.parseEther("0.5") });
      }
      await tx.wait();
      getBalance();
    }
  };

  const handleRoomChange = (event) => {
    setRoomType(event.target.value);
  };

  const deposit = async () => {
    if (atm && depositAmount !== "") {
      const amountWei = ethers.utils.parseEther(depositAmount);
      let tx = await atm.deposit({ value: amountWei });
      await tx.wait();
      getBalance();
      setDepositAmount(""); // Clear depositAmount after depositing
    }
  };
  

  const handleDepositAmountChange = (event) => {
    setDepositAmount(event.target.value);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this application.</p>;
    }

    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your MetaMask wallet
        </button>
      );
    }

    if (balance === "0") { // Check if balance is "0" as string
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div>
          <input
            type="radio"
            id="deluxe"
            name="roomType"
            value="deluxe"
            checked={roomType === "deluxe"}
            onChange={handleRoomChange}
          />
          <label htmlFor="deluxe">Deluxe</label>
        </div>
        <div>
          <input
            type="radio"
            id="premium"
            name="roomType"
            value="premium"
            checked={roomType === "premium"}
            onChange={handleRoomChange}
          />
          <label htmlFor="premium">Premium</label>
        </div>
        <div>
          <input
            type="radio"
            id="basic"
            name="roomType"
            value="basic"
            checked={roomType === "basic"}
            onChange={handleRoomChange}
          />
          <label htmlFor="basic">Basic</label>
        </div>
        <div>
        <button onClick={bookRoom}>Book Room</button>
        </div>
        <input
          type="text"
          placeholder="Enter amount (ETH)"
          value={depositAmount}
          onChange={handleDepositAmountChange}
        />
        <button onClick={deposit}>Deposit</button>
        </div>
    );
  };

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Hotel Cloud!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}

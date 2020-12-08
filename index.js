require('dotenv').config();
const Web3= require('web3');
const fs = require('fs');
//var Tx = require('ethereumjs-tx');
const prompt = require('prompt-sync')({sigint: true});

const PROJECT_ID = process.env.PROJECT_ID
let wallet;
let web3;

const readFile = function(){
    return new Promise(function(resolve,reject){
       fs.readFile('./wallets.json', 'utf-8', function(err, data) {
           err ? reject(err) : resolve(data)
       })
    })
}

const writeFile = function(array){
    return new Promise(function(resolve,reject){
        fs.writeFile('./wallets.json', JSON.stringify(array), 'utf-8', function(err,data) {
           err ? reject(err) : resolve(data)
       })
    })
}

//Function to check balance
const checkBalance = function(index) {   

    web3.eth.getBalance(web3.eth.accounts.wallet[index].address)
    .then(function(res){
        console.log(res);
        choiceFunction();
    })
    .catch(function(){
        console.log("Invalid index number");
        choiceFunction();
    });
 }

//function to check network status
const networkStatus = function() {    
    web3.eth.net.getNetworkType()
         .then(function(res){
                     console.log(`Network Type : ${res}`);
                     web3.eth.getBlockNumber()
                     .then(function(res){
                           console.log(`BlockNumber : ${res}`);
                           choiceFunction();
            });
        });
     }
    

//function to send transact ethers
const transact = function() {
   let from11 = Number(prompt("Enter From Account Index: "));
   let to11 = prompt("Enter To Address: ");
   let value11 = Number(prompt("Enter Amount in Weis: "));   
   if(web3.eth.accounts.wallet[from11]) {
   web3.eth.sendTransaction({from: web3.eth.accounts.wallet[from11].address, to:to11, value: Number(value11), gasLimit: 21000, gasPrice: 20000000000})
   .then(function(res){
       console.log(res);
       choiceFunction();
       })
   .catch(function(err){
       console.log(err);
       choiceFunction(); 
   })
      }
   else{console.log("Enter valid Account index");
        choiceFunction(); }
}

//function to display wallet
const displayWallet = function(){
       console.log(wallet);
       choiceFunction();
}

//Choose action
const choiceFunction = function() { 
    let index;
    const choice = prompt('Choose action : 1. Check Balance 2. Transact 3. Check Network Status 4. View Wallet 5. Change Network 6. Exit ')   
       switch(Number(choice))
       {
          case 1:
               index = Number(prompt("Enter index of account in wallet "));
               checkBalance(index); break;
           case 2:
               transact(); break;
           case 3:
               networkStatus(); break;
           case 4:
               displayWallet(); break;
           case 5:
                chooseNetwork(); break;
           case 6:
               process.exit(); break;
            default:
                console.log("Choose valid option ");
                choiceFunction();
       }
   }

//Choose to create or import account
const accountCreation = function() {
    let continued;
    do{
    const accountType = prompt('Choose (1/2) : 1. Create a new account 2. Import an account '); 
    let account11, pkey,acc;
    const chooseAccount = function(number) {    
        switch(Number(number))
        {
           case 1:
               account11= web3.eth.accounts.create();
               console.log(account11);
               return web3.eth.accounts.wallet.add(account11);
           case 2:
               pkey= prompt("Enter private key ")
               acc = web3.eth.accounts.privateKeyToAccount(pkey);
               return web3.eth.accounts.wallet.add(acc);
           default:
               console.log("Choose valid option ");
               accountCreation();
        }
    }
    chooseAccount(accountType);    
    continued = prompt("Choose 1. Add another account 2. Continue ");
    } while(Number(continued)==1)
    }


const createWallet =  function() {
    wallet = web3.eth.accounts.wallet.create();
    const userName = prompt("Enter Username ");
    const pwd = prompt("Enter password to encrypt wallet ");
    accountCreation();
    
    const keystore = web3.eth.accounts.wallet.encrypt(pwd);
    readFile().then(function(data) {
                var array = JSON.parse(data);
                const data1 = {'UserName' : userName,
                               'Keystore' : keystore };
                array.wallets.push(data1);
                writeFile(array).then(function(){
                 console.log('Wallet created ! ');
                 choiceFunction();
                })
 });
 }

 const importWallet = function() {
    let found =0;
    const userName = prompt('Enter UserName: ');
    const passWord = prompt('Enter Password: ');
    readFile().then(function(data) {
        var array = JSON.parse(data);
        for(let i=0; i<array.wallets.length; i++){
            if(array.wallets[i].UserName == userName) 
            {
                const keystore = array.wallets[i].Keystore;
                console.log(keystore);
                wallet = web3.eth.accounts.wallet.decrypt(keystore,passWord);   
                console.log(wallet); found =1;   
                choiceFunction();
                
            }
        }
        if(found == 0) { 
            console.log("Invalid UserName !");
        walletSelection();}
        
    } )
    }


//Create or import wallet
const walletSelection = function() {
    console.log("Set Wallet: ")
    const choose = prompt("1. Create new wallet 2. Sign in to wallet ");
    switch(Number(choose)){
        case 1:
            createWallet(); break;
        case 2:
            importWallet(); break; 
        default:
            console.log("Choose valid option ");
            walletSelection();   
    }
}

//Choose type of network to connect
const chooseNetwork = function() {   
    const network = prompt('Choose Network type (Enter 1/2/3) : 1. Mainnet 2. Ropsten 3. Rinkeby ') 
    let networkName;
    switch(Number(network))
    {
       case 1:
           networkName = "mainnet"; break;
        case 2:
            networkName = "ropsten"; break;
        case 3:
            networkName = "rinkeby"; break;
        default:
            console.log("Choose valid network");
            chooseNetwork();

    }
    web3= new Web3( new Web3.providers.HttpProvider(`https://${networkName}.infura.io/v3/${PROJECT_ID}`));
    
}

//Connect to network 
chooseNetwork();
require('dotenv').config();
const Web3= require('web3');
const prompt = require('prompt-sync')({sigint: true});

const PROJECT_ID = process.env.PROJECT_ID

//Choose type of network to connect
const network = prompt('Choose Network type (Enter 1/2/3) : 1. Mainnet 2. Ropsten 3. Rinkeby ')
const chooseNetwork = function(number) {    
    switch(Number(number))
    {
       case 1:
           return "mainnet";
        case 2:
            return "ropsten";
        case 3:
            return "rinkeby";
    }
}

//Connect to network 
const networkName = chooseNetwork(network);
const web3= new Web3( new Web3.providers.HttpProvider(`https://${networkName}.infura.io/v3/${PROJECT_ID}`));

//Create wallet
const wallet = web3.eth.accounts.wallet.create();

//Choose to create or import account
let continued;
do{
const accountType = prompt('Choose (1/2) : 1. Create a new account 2. Import an account ') 
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
    }
}
chooseAccount(accountType);

continued = prompt("Choose 1. Import/Create new account 2. Continue ");
}while(Number(continued)==1)


//Function to check balance
const checkBalance = function() {    
    let index = Number(prompt("Enter index of account in wallet "));

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
   console.log("Hello Mate");
   choiceFunction();
}


//function to display wallet
const displayWallet = function(){
       console.log(wallet);
       choiceFunction();
}


//Choose action
const choiceFunction = function() { 
    
    const choice = prompt('Choose action : 1. Check Balance 2. Transact 3. Check Network Status 4. View Wallet 5. Exit ')   
       switch(Number(choice))
       {
          case 1:
               checkBalance();
               break;
           case 2:
               transact();
               break;
           case 3:
               networkStatus();
               break;
           case 4:
               displayWallet();
               break;
           case 5:
               process.exit();
       }
   }
   
choiceFunction();   
   














/*
const aaccountAddress = web3.eth.accounts.wallet[1].address;
web3.eth.getBalance(aaccountAddress).then(console.log);

const aaccountAddress1 = web3.eth.accounts.wallet[0].address;
web3.eth.getBalance(aaccountAddress1).then(console.log);
*/



//web3.eth.accounts.wallet.save("hello");

/*
const account1 = web3.eth.accounts.wallet.add(ADDRESS1);
console.log(account1); */
//const account2 = web3.eth.accounts.wallet.add(ADDRESS2);
/*console.log(account2);
web3.eth.getBalance(account1.address).then(console.log);
web3.eth.getBalance(account2.address).then(console.log);   
const account3 = web3.eth.accounts.create();
web3.eth.accounts.wallet.add(account2);
web3.eth.accounts.wallet.add(account3);
//console.log(wallet);
//web3.eth.accounts.wallet.remove(account2);
//web3.eth.accounts.wallet.clear();
console.log(wallet); */

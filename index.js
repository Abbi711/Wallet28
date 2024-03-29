require('dotenv').config();
const Web3= require('web3');
const fs = require('fs');
const prompts = require('prompts');

const PROJECT_ID = process.env.PROJECT_ID
let wallet;
let web3;

//Read from json file
async function readFile(name){
    return new Promise(function(resolve,reject){
       fs.readFile(`./${name}.json`, 'utf-8', function(err, data) {                        //asynchronous read function
           err ? reject(err) : resolve(data)
       })
    })
}

//Write to json file
async function writeFile(array, name){
    return new Promise(function(resolve,reject){
        fs.writeFile(`./${name}.json`, JSON.stringify(array), 'utf-8', function(err,data) { //asynchronous write function 
           err ? reject(err) : resolve(data)           
       })
    })
}

//Function to Check balance 
async function checkBalance() {                                               
   let index = await prompts({
        type: 'number',
        name: 'value',
        message: 'Enter index of account in wallet ',});  
   if(web3.eth.accounts.wallet[index.value]){
     await web3.eth.getBalance(web3.eth.accounts.wallet[index.value].address)
       .then(console.log)
       .catch(console.log)}
    else{ console.log("Invalid Index number ");}
 }

//Function to Check status of network
async function networkStatus() {
    const type = await web3.eth.net.getNetworkType();
    const block = await web3.eth.getBlockNumber();
    console.log(`Network Type : ${type} \n BlockNumber : ${block}`);
}

//Check sender's account and balance
async function checkTxn(from,to,value1){                                           
    let balance, bool;                                                    
    if(web3.eth.accounts.wallet[from]){                                                 //sender's account exists
        if(web3.eth.accounts.wallet[from].address == to)                                //receiver's account valid
            {console.log("Sender's and Receiver's address are the same ");
             bool= false; }
        else{
            await web3.eth.getBalance(web3.eth.accounts.wallet[from].address)
                  .then((res) => {
                         balance = res;
                         if(balance<(value1+21000)){                                    //Sufficient funds
                              console.log("Insufficient funds in account !"); bool= false; }
                          else bool = true;})
            }
        }
       
    else{
        console.log("Enter valid Account index"); 
        bool = false; }
    return bool;
}

//Function to send ethers
async function transact(){
    const from11 = await prompts({
        type: 'number',
        name: 'value',
        message: 'Enter From Account Index: ',});                                    //Index of account in wallet
    const to11 = await prompts({
        type: 'text',
        name: 'value',
        message: 'Enter To Account Address: ',});                                    //Public key of receiver's account
    const value11 = await prompts({
        type: 'number',
        name: 'value',
        message: 'Enter Amount in Weis: ',});

    if(await checkTxn(from11.value, to11.value, value11.value)) {   
        let flag=0;                             
        let account = web3.eth.accounts.wallet[from11.value];                       
        let txnObjext = {
            from: account.address,
            to: to11.value,
            value: value11.value,
            gas: 21000,
            gasPrice: 20000000000 };                                                 //create txn object
        let txn;
        await web3.eth.accounts.signTransaction(txnObjext,account.privateKey)        //sign txn with sender's private key
           .then(txn1 => { txn = txn1; flag=1; })
           .catch(() => {console.log("Receiver's address invalid"); return;})
        if(flag==1) {await web3.eth.sendSignedTransaction(txn.rawTransaction)            
           .then(Receipt => console.log(`Amount Transferred ! Txn Hash: ${Receipt.transactionHash}`) ) }}
          // .catch(err => {console.log(err); choiceFunction()}) }
} 

//Function to display wallet
const displayWallet = function(){
       console.log(wallet);
}


//Choose wallet action
async function choiceFunction() { 
    const choice = await prompts({
        type: 'number',
        name: 'value',
        message: 'Choose action : 1. Check Balance 2. Transact 3. Check Network Status 4. View Wallet 5. Change Network 6. Exit ',
        validate: value => value>0 && value<7 ? true : 'Choose valid option '});   
       switch(Number(choice.value))
       {
          case 1:
               await checkBalance(); break;
           case 2:
               await transact(); break;
           case 3:
                await networkStatus(); break;
           case 4:
                displayWallet(); break;
           case 5:
                await chooseNetwork(); return;
           case 6:
               process.exit(); 
       }
       choiceFunction();
   }


//Choose to create or import account
async function accountCreation() {
    let continued;
    do{
        const accountType = await prompts({
            type: 'number',
            name: 'value',
            message: 'Choose (1/2) : 1. Create a new account 2. Import an account ',
            validate: value => value>0 && value<=2 ? true : 'Choose valid option ' });    
    let account11, pkey,acc;
    switch(Number(accountType.value))
        {
           case 1:
               account11= web3.eth.accounts.create();
               console.log(account11);
               web3.eth.accounts.wallet.add(account11); break;
           case 2:
              pkey = await prompts({
                type: 'password',
                name: 'value',
                message: 'Enter Private key ',}); 
               acc = web3.eth.accounts.privateKeyToAccount(pkey.value);              //Import account using Private key
               web3.eth.accounts.wallet.add(acc); break;
        }   
    continued = await prompts({
            type: 'number',
            name: 'value',
            message: 'Choose 1. Add another account 2. Continue ',
            validate: value => value==1 || value==2 ? true : 'Choose valid option '});
    } while(continued.value==1)
    }


//Function to update wallet's keystore in json file
async function updateFile(userName, keystore){
    const data1 = {'UserName' : userName,                                          //Create json object and write to file
    'Keystore' : keystore };
     writeFile(data1,userName).then(console.log('Wallet created ! '));
    
}

//check if username is already takem
async function checkName1(userName){
    if(fs.existsSync(`./${userName}.json`))                                      //sync function to check file existence
        return false;
    return true;
}

//Create a new wallet and add accounts
async function createWallet() {
    wallet = web3.eth.accounts.wallet.create();
    const userName = await prompts({
        type: 'text',
        name: 'value',
        message: 'Enter UserName: ',}); 
      let check = await checkName1(userName.value)
      if(check){
           const pwd = await prompts({
                 type: 'password',
                 name: 'value',
                 message: 'Enter Password: ',}); 
           await accountCreation();
           const keystore = web3.eth.accounts.wallet.encrypt(pwd.value);
           await updateFile(userName.value, keystore)
           choiceFunction(); 
        }
       else{console.log("Username already Taken "); createWallet();}
  }

//Add account to existing wallet
async function modifyWallet(userName,pwd){
    let keystore;
    const modify = await prompts({
        type: 'number',
        name: 'value',
        message: '1. Add a new account 2. Continue ',
        validate: value => value == 1 || value ==2 ? true : 'Choose valid option ' }); 
         
    switch(modify.value){
        case 1:
            await accountCreation();
            keystore = web3.eth.accounts.wallet.encrypt(pwd);
            await updateFile(userName, keystore)                                 //Write modified keystore to json file
            break;
        case 2:
            break;    
    }     
    choiceFunction();
}

 //Import existing wallet with password
async function importWallet(){
    const userName = await prompts({
        type: 'text',
        name: 'value',
        message: 'Enter UserName: ', }); 
    const password = await prompts({
        type: 'password',
        name: 'value',
        message: 'Enter Password: ', }); 
       
    readFile(userName.value)
        .then(function(data) {
        var data1 = JSON.parse(data);
                const keystore = data1.Keystore;
                wallet = web3.eth.accounts.wallet.decrypt(keystore,password.value);   
                console.log(wallet);   
                modifyWallet(userName.value,password.value);})                    //OPtion to add additional accounts
        .catch(function() { 
            console.log("Invalid Credentials !");
             walletSelection();})
    }


//Choose to Create or import wallet
async function walletSelection() {
    console.log("Set Wallet: ")
    const choose = await prompts({
        type: 'number',
        name: 'value',
        message: '1. Create new wallet 2. Sign in to wallet  ',
        validate: value => value==1 || value==2 ? true : 'Choose valid option ' }); 
    switch(choose.value){
        case 1:
            createWallet(); break;
        case 2:
            importWallet(); break;   
    }
}

//Choose type of network to connect :
async function chooseNetwork() {
        const network = await prompts({
          type: 'number',
          name: 'value',
          message: 'Choose Network type (Enter 1/2/3) : 1. Mainnet 2. Ropsten 3. Rinkeby ',
          validate: value => value>0 && value<=3 ? true : 'Choose valid option '}); 
    let networkName;
    switch(Number(network.value))
    {
       case 1: 
            networkName = "mainnet"; break;
        case 2:
            networkName = "ropsten"; break;
        case 3:
            networkName = "rinkeby"; break;
    }
    web3= await new Web3( new Web3.providers.HttpProvider(`https://${networkName}.infura.io/v3/${PROJECT_ID}`));
    walletSelection();
}

//Connect to network 
chooseNetwork();

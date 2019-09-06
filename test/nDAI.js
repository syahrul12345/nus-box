const Web3 = require('Web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'),null,{
	transactionConfirmationBlocks:1,
})

//lets get all the testing for mocha
const assert = require('assert')
//get the contract ABI
try{
	const nDAIABI = require('./../build/contracts/NDAI.json')
	let accounts;
	let nDAI;
	const ethersToSend = [0.1,0.24,3,4,5,6,7,8]

	before(async() => {
		accounts = await web3.eth.getAccounts()
		let contract = new web3.eth.Contract(nDAIABI.abi)
		await contract.deploy({
			data:nDAIABI.bytecode
		}).send({
			from:accounts[0],
			gasLimit:6721975,
			gasPrice:20000000000
		}).on('transactionHash',(transactionHash) => {
			console.log("Propogated transaction to the blockchain")
		}).on('reciept',(receipt) => {
		}).then((instance) => {
			nDAI = new web3.eth.Contract(nDAIABI.abi,instance.options.address)
		})

	})

	describe('Send some Ether to MetaMask accounts',() => {
		it('Succesfully sent some ether to metamask account 0x7F1A066d59B92623b20e501Ca976138f8b7A8f6f',async() =>{
			var txPayload = {
				from:accounts[0],
				to:'0x7F1A066d59B92623b20e501Ca976138f8b7A8f6f',
				value:web3.utils.toWei('10','ether')
			}
			web3.eth.sendTransaction(txPayload).on('receipt',(receipt) => {
				console.log("transferred to main eth address")
			})
		})
	})

	describe('Contract Creation',() => {
		it('Contract created succesfully',() => {
			console.log(`Created at: ${nDAI.options.address}`)
			assert.ok(nDAI.options.address)

		})
		
	})

	describe('Checking values for sending and receiving',() => {
		it(`Checking that the number of nDAi owned is totalSupply for owner`,async() => {
			var balance = await nDAI.methods.balanceOf(accounts[0]).call()
			var totalSupply = await nDAI.methods.totalSupply().call()
			assert.equal(parseInt(balance),totalSupply,'Balance is correct')
		})
		it('Checking that the number of nDai owned is 0 for other accounts',async() => {
			var balance = await nDAI.methods.balanceOf(accounts[1]).call()
			assert.equal(parseInt(balance),0,'Balance is correct')
		})
		it('Checking that the number of nDai owned is 0 for other accounts',async() => {
			var balance = await nDAI.methods.balanceOf(accounts[2]).call()
			assert.equal(parseInt(balance),0,'Balance is correct')
		})
		it('Checking that the number of nDai owned is 0 for other accounts',async() => {
			var balance = await nDAI.methods.balanceOf(accounts[3]).call()
			assert.equal(parseInt(balance),0,'Balance is correct')
		})
		
	})

	describe('Each Account send a variable amount of ether and then check balance',() => {
		ethersToSend.forEach((ether,index) => {
			it(`${index}th account to send ${ether} ether and check that the balance is ${ether*200} nDAI`,async() => {
				await web3.eth.sendTransaction({
					from:accounts[index+1],
					to:nDAI.options.address,
					value:web3.utils.toWei(ether.toString(),'ether')
				})
				var balance = await nDAI.methods.balanceOf(accounts[index+1]).call()
				assert.equal(parseInt(balance)/1000000000000000000,ether*200,'Balance isnt correct')
			})
			it(`Check that the contract returns the correct amount of Ether contribution`,async() => {
				var contribution = await nDAI.methods.getContribution(accounts[index+1]).call()
				assert.equal(parseInt(contribution)/1000000000000000000,ether,'Contribution isnt correct')
			})
		})
	})
	describe('Send nDAI to metamask accounts',() => {
		metamaskAccounts = [
		'0x7F1A066d59B92623b20e501Ca976138f8b7A8f6f',
		'0x98b661759c5CA70C13d8fB91730eACa39c7773e1',
		]
		metamaskAccounts.forEach((account,index) => {
			it(`Sending to metamask account ${account} 100nDAI from main account`,async() => {
				await nDAI.methods.transfer(account,web3.utils.toWei('100','ether')).send({
					from:accounts[0]
				}).on('transactionHash',(transactionHash) => {
					assert.ok(transactionHash)
				})
			})
			it(`Checking nDAI balance for account ${account}`,() => {
				nDAI.methods.balanceOf(account).call().then((result) => {
					assert.equal(parseInt(result)/1000000000000000000,100,'Balance is not equal')
				})
			})

			it(`Checking contribution for account ${account} is 0 ETH`,() => {
				nDAI.methods.getContribution(account).call().then((contribution) => {
					assert.equal(parseInt(contribution)/1000000000000000000,0,'Contribution is not correct')
				})
			})
			//let's check for osme balance
		})
	})
	describe('Check that the total supply remain constant, but balance of owner decrease',() => {
		it('The balance for the owner is lesser than total supply',async () => {
			var mainBalance = await nDAI.methods.balanceOf(accounts[0]).call()
			var totalSupply = await nDAI.methods.totalSupply().call()
			assert.notEqual(mainBalance/1000000000000000000,totalSupply/1000000000000000000,"Main balance and total supply equals!")
		})

	})
}catch(ex) {
	console.log(ex.toString())
}





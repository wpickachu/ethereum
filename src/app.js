import React, { Component } from 'react';

// Styling the application
import { Layout } from "./Layout";
import './App.css';

// importing eth dependencies
import web3 from './web3';
import ipfs from './ipfs';
import dts from './dStorage';

// 0chain dStorage Metadata generated by the client
import { ZBOX_METADATA } from './config';
import zbox from './zbox/zbox';

class App extends Component {

  state = {
    documentHash: ZBOX_METADATA.documentHash,
    authTicket: ZBOX_METADATA.authTicket,
    lookupHash: ZBOX_METADATA.lookupHash,
    ethAddress: '',
    blockNumber: '',
    transactionHash: '',
    gasUsed: '',
    txReceipt: '',
    value: '',
  };

  uploadMetadataToZbox = (event) => {
    event.stopPropagation()
    event.preventDefault()
    zbox.uploadFile()
  };

  batchUploadMetadataToZbox = (event) => {
    zbox.batchUploadFile()
  };

  onClick = async () => {
    try {
      this.setState({ blockNumber: "waiting.." });
      this.setState({ gasUsed: "waiting..." });

      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt) => {
        console.log(err, txReceipt);
        this.setState({ txReceipt });
      });

      await this.setState({ blockNumber: this.state.txReceipt.blockNumber });
      await this.setState({ gasUsed: this.state.txReceipt.gasUsed });
    }

    catch (error) {
      console.log(error);
    }
  }

  onSubmit = async (event) => {
    event.preventDefault();
    const accounts = await web3.eth.getAccounts();

    console.log('Sending from Metamask account: ' + accounts[0]);

    const ethAddress = await dts.options.address;
    this.setState({ ethAddress });



    /*await ipfs.add(this.state.buffer, (err, documentHash, authTicket, lookupHash) => {
      this.setState({ documentHash: documentHash[0].hash, authTicket: authTicket[1].hash, lookupHash: lookupHash[2].hash });*/

      dts.methods.uploadMetadata(this.state.documentHash, this.state.authTicket, this.state.lookupHash).send({
        from: accounts[0]
      }, (error, transactionHash) => {
        console.log(transactionHash);
        this.setState({ transactionHash });
      });
  };

  render() {

    return (
      <React.Fragment>
        <Layout>
          <div className="text-center">
              <h1 className="text-white justify-center text-center"> 0chain Integration with Ethereum </h1>
                <hr/>

                <form onSubmit={this.onSubmit} >
                  <h4 className="text-white justify-center" >Upload File Metadata to Ethereum</h4>
                  <br />
                  <div>
                    <label className="text-white justify-center font-bold text-center">Hash: </label>
                    
                    <input
                      value={this.state.value}
                      onChange={event =>
                        this.setState({ value: event.target.value })
                      }
                    />
                    
                  </div>
                  <br />
                  <button className= "text-center">Commit Metadata </button>
                  <hr/>
                </form>
                <h4 className="text-white justify-center" >Get Transaction Receipt </h4>
                <br />
                <button onClick={this.onClick} className = "text-center">Tx Receipt</button>
                <h4 className="text-white justify-center">{this.state.message}</h4>
          </div>
        </Layout>
      </React.Fragment>
    );
  }
}
export default App;
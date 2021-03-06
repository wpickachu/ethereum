import React, { Component } from 'react';
import { Row, Col, Button, Table, Spinner} from 'reactstrap';
import zbox from '../../images/stats/zbox.png';
import no_of_txs from '../../images/stats/no_of_txs.png';
import eth from '../../images/stats/eth.png';
import MetricBox from '../../components/transactions/MetricBox';
import ShowModal from '../../components/modal/ShowModal';

// importing ethereum dependencies
import web3 from '../../web3';
import dts from '../../dStorage';

// 0chain dStorage Metadata
import zbox_config from '../../config/config.json'

// 0chain commit metadata - importing JS Client SDK
import config from '../../0chain/cluster'
import jsClientSdk from '0chain';

// Initialize 0Chain jsClientSDK
jsClientSdk.init(config, window.bls);

class TransactionStats extends Component { 

  state = {
    documentHash: zbox_config["ZBOX_METADATA"].documentHash,
    authTicket: zbox_config["ZBOX_METADATA"].authTicket,
    lookupHash: zbox_config["ZBOX_METADATA"].lookupHash,
    ethAddress: '',
    blockNumber: '',
    transactionHash: '',
    gasUsed: '',
    txReceipt: '',
    allocationId: zbox_config["0chain"].allocation,
    remotePath: zbox_config["0chain"].remote_path,
    walletInfo: zbox_config["0chain"].client_json,
    client_id: zbox_config["0chain"].client_json.client_id
  };
  
  onClick = async () => {
    try {
      this.setState({ blockNumber: <Spinner color="dark" /> });
      this.setState({ gasUsed: <Spinner color="dark" /> });
  
      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt) => {
        console.log(err, txReceipt);
        this.setState({ txReceipt });
      });
  
      await this.setState({ blockNumber: this.state.txReceipt.blockNumber });
      await this.setState({ gasUsed: this.state.txReceipt.gasUsed });
    }
  
    catch (error) {
      console.log(error)
    }
  }
  
  onPress = async (event) => {
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();
    console.log(this.state.client_id)
    const ethAddress = await dts.options.address;
    this.setState({ ethAddress });

    try {
        // Fetching metadata from 0Chain blockchain.
        await jsClientSdk.getFileMetaDataFromPath(this.state.allocationId, 
        this.state.remotePath, this.state.client_id).then((res) => {
          this.setState({documentHash: res.hash,
          authTicket: res.merkle_root, lookupHash: res.lookup_hash})
      }, (error) => {
        console.log(error);
      })
    }
    catch (error) {
      console.log(error);
    }
    // Uploading metadata (proof) to Ethereum.
    await dts.methods.uploadMetadata(this.state.documentHash, this.state.authTicket, this.state.lookupHash).send({
      from: accounts[0]
      }, (error, transactionHash) => {
        console.log(transactionHash);
        this.setState({ transactionHash });
    });
  };
  
    render() {
      return (
        <div>
          <Row>
            <Col md="4">
              <MetricBox
                metric={'Upload File to 0Chain'}
                value={''}
                icon={zbox}
              />
              <br/>
              <ShowModal />
            </Col>
            <Col md="4">
              <MetricBox
                metric={'Commit Meta to Ethereum'}
                value={''}
                icon={eth}
              />
              <br/>
              <Button onClick={this.onPress}>Commit</Button>
            </Col>
            <Col md="4">
              <MetricBox
                metric={'Transaction Details'}
                value={''}
                icon={no_of_txs}
              />
              <br/>
              <Button onClick={this.onClick}>Transaction Details</Button>
            </Col>
          </Row>
          <div>
            <br/>
            <br/>
          <Table bordered responsive>
              <thead>
                <tr>
                  <th>Ethereum Transaction Details</th>
                  <th>Values</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Document Hash</td>
                  <td>{this.state.documentHash}</td>
                </tr>
                <tr>
                  <td>Lookup Hash</td>
                  <td>{this.state.lookupHash}</td>
                </tr>
                <tr>
                  <td>Allocation ID</td>
                  <td>{this.state.allocationId}</td>
                </tr>
                <tr>
                  <td>Ethereum Contract Address</td>
                  <td>{this.state.ethAddress}</td>
                </tr>
                <tr>
                  <td>Transaction Hash </td>
                  <td>{this.state.transactionHash}</td>
                </tr>
                <tr>
                  <td>Block Number </td>
                  <td>{this.state.blockNumber}</td>
                </tr>
                <tr>
                  <td>Gas Used</td>
                  <td>{this.state.gasUsed}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      );
    }
  }

  export default TransactionStats;  
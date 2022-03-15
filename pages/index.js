import { useEffect, useState } from 'react';
import Layout from '../components/layout'
import Head from 'next/head'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal';
import CampaignFactory from './../ethereum/artifacts/contracts/CampaignFactory.sol/CampaignFactory.json';
import Campaign from './../ethereum/artifacts/contracts/Campaign.sol/Campaign.json';
import { Button, Card, Table } from 'semantic-ui-react';
import { useRouter } from 'next/router';


export default function Home() {
  const campaignMapper = ['name', 'description', 'fundRequest', 'fundRaised', 'minimumContribution', 'requestCounter', 'contributorCount', 'manager'];
  const [campaignList, setCampaignList] = useState([]);
  const router = useRouter();
  useEffect(() => {
    fetchCampaigns();
  }, [])

  const getWeb3Setup = async () => {
    const web3Modal = new Web3Modal({ network: 'hardhat' });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    return signer;
  }

  const fetchCampaigns = async () => {
    try {
      const signer = await getWeb3Setup()
      const contract = new ethers.Contract(process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_CONTRACT, CampaignFactory.abi, signer);
      const request = await contract.getDeployedCampaigns();
      const campaigns = [];
      for (const campaign of request) {
        const campaignContract = new ethers.Contract(campaign, Campaign.abi, signer);
        const campaignData = await campaignContract.getCampaignData();
        const cMapped = campaignData.reduce((acc, el, idx) => {
          if (idx < 2 || idx > 6) {
            acc[campaignMapper[idx]] = el;
          } else {
            if (['requestCounter', 'contributorCount'].includes(campaignMapper[idx])) {
              acc[campaignMapper[idx]] = ethers.utils.formatUnits(el, 0);
            } else {
              acc[campaignMapper[idx]] = ethers.utils.formatEther(el);
            }
          }
          return acc;
        }, {});
        cMapped['address'] = campaign;
        campaigns.push(cMapped);
      }
      setCampaignList(campaigns)
    } catch (error) {
      console.log(error);
    }
  }

  const onContribute = async (address) => {
    const signer = await getWeb3Setup()
    const campaignContract = new ethers.Contract(address, Campaign.abi, signer);
    const campaignData = await campaignContract.contribute({
      gasLimit: 30000000,
      value: ethers.utils.parseUnits('1', 'ether')
    });
    console.log(campaignData);
    fetchCampaigns();
  }

  const handleClick = (e, address) => {
    e.preventDefault()
    router.push(`campaign/${address}`);
  }

  return (
    <div>
      <Head>
        <title>KickStarter</title>
        <meta name="description" content="Kickstarter clone using Solidity" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Manager</Table.HeaderCell>
              <Table.HeaderCell>Fund Status</Table.HeaderCell>
              <Table.HeaderCell>Contributors</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {
              campaignList.map((campaign) => (<Table.Row key={campaign.address}>
                <Table.Cell onClick={(ev) => handleClick(ev, campaign.address)}>{campaign.name}</Table.Cell>
                <Table.Cell>{campaign.manager}</Table.Cell>
                <Table.Cell>{campaign.fundRaised}/{campaign.fundRequest}</Table.Cell>
                <Table.Cell>{campaign.contributorCount}</Table.Cell>
                <Table.Cell>
                  <Button positive onClick={() => { onContribute(campaign.address) }}>Contribute</Button>
                </Table.Cell>
              </Table.Row>))
            }
          </Table.Body>
        </Table>
      </Layout>
    </div>
  )
}

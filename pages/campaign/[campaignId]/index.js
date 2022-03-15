import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react'
import { Button, Table } from 'semantic-ui-react';
import AddSpendRequestModal from '../../../components/addRequest';
import Layout from '../../../components/layout';
import Campaign from './../../../ethereum/artifacts/contracts/Campaign.sol/Campaign.json';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
function CampaignDetailsPage() {
    const requestHeaders = ['description', 'value', 'recipient', 'status', 'approvalCount']
    const { query } = useRouter();
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestList, setRequestList] = useState([]);
    useEffect(() => {
        if (query.campaignId) {
            fetchSpendRequest();
        }
    }, [query.campaignId]);

    const getWeb3Setup = async () => {
        const web3Modal = new Web3Modal({ network: 'hardhat' });
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        return signer;
    }
    const fetchSpendRequest = async () => {
        const signer = await getWeb3Setup();
        const contract = new ethers.Contract(query.campaignId, Campaign.abi, signer);
        const totalContributors = await contract.contributorCount();
        const data = await contract.fetchSpendRequest();
        const requestArr = [];
        for (const request of data) {
            const cMapped = request.reduce((acc, el, idx) => {
                if (requestHeaders[idx] === 'value') {
                    acc.value = ethers.utils.formatEther(el);
                } else if (requestHeaders[idx] === 'approvalCount') {
                    acc.approvalCount = ethers.utils.formatUnits(el, 0);
                } else {
                    acc[requestHeaders[idx]] = el;
                }
                acc.showFinalized = acc.approvalCount >= Math.floor(totalContributors / acc.approvalCount) && !acc.status;
                acc['totalContributors'] = ethers.utils.formatUnits(totalContributors, 0);
                return acc;
            }, {});
            requestArr.push(cMapped);
        }
        setRequestList(requestArr)
    }

    const onApprove = async (idx) => {
        const signer = await getWeb3Setup();
        const contract = new ethers.Contract(query.campaignId, Campaign.abi, signer);
        const data = await contract.approveSpendRequest(idx);
        fetchSpendRequest();
    }

    const onFinalize = async (idx) => {
        const signer = await getWeb3Setup();
        const contract = new ethers.Contract(query.campaignId, Campaign.abi, signer);
        const data = await contract.finalizeRequest(idx);
        fetchSpendRequest();
    }
    return (
        <Layout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Spend Requests</h3>
                <Button positive onClick={() => setShowRequestModal(true)}>Add Request</Button>
            </div>
            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Description</Table.HeaderCell>
                        <Table.HeaderCell>Recipient</Table.HeaderCell>
                        <Table.HeaderCell>Value</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Approvals</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        requestList.map((request, idx) => (<Table.Row key={idx.toString()}>
                            <Table.Cell>{request.description}</Table.Cell>
                            <Table.Cell>{request.recipient}</Table.Cell>
                            <Table.Cell>{request.value}</Table.Cell>
                            <Table.Cell>{!request.status ? 'InProgress' : 'Completed'}</Table.Cell>
                            <Table.Cell>{request.approvalCount}/{request.totalContributors}</Table.Cell>
                            <Table.Cell>
                                {!request.status ? <Button positive onClick={() => onApprove(idx)}>Approve</Button> : <></>}
                                {request.showFinalized ? <Button primary onClick={() => onFinalize(idx)}>Finalize</Button> : <></>}
                            </Table.Cell>
                        </Table.Row>))
                    }
                </Table.Body>
            </Table>
            <AddSpendRequestModal open={showRequestModal} campaignAddress={query?.campaignId} onClose={() => setShowRequestModal(false)} />
        </Layout>
    )
}

export default CampaignDetailsPage;
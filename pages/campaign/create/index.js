
import React, { useState } from 'react';
import { ethers } from 'ethers'
import { Button, Form, Input } from 'semantic-ui-react';
import Layout from '../../../components/layout';
import Web3Modal from 'web3modal';
import CampaignFactory from './../../../ethereum/artifacts/contracts/CampaignFactory.sol/CampaignFactory.json'

export default function CreateCampaign(params) {
    const [form, setForm] = useState({
        campaignName: '',
        description: '',
        fundRequest: 0,
        minimumContribution: 0
    });

    const onInputChange = (ev) => {
        const { name, value } = ev.target;
        setForm({
            ...form,
            [name]: value,
        });
    }

    const onSubmit = async () => {
        const web3Modal = new Web3Modal({ network: 'hardhat' });
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_CONTRACT, CampaignFactory.abi, signer);
        const request = await contract.createCampaigns(ethers.utils.parseEther(form.minimumContribution), ethers.utils.parseEther(form.fundRequest), form.description, form.campaignName, {
            gasLimit: 30000000,
        });
    }

    return (
        <div>
            <Layout>
                <Form>
                    <Form.Field>
                        <label>Campaign Name</label>
                        <input placeholder='Campaign Name' value={form.campaignName} name="campaignName" onChange={onInputChange} />
                    </Form.Field>
                    <Form.Field>
                        <label>Campaign Description</label>
                        <textarea placeholder='Campaign Description' value={form.description} name="description" onChange={onInputChange}> </textarea>
                    </Form.Field>
                    <Form.Field>
                        <label>Requested Contibution</label>
                        <Input placeholder='Requested Contibution' value={form.fundRequest} name="fundRequest" labelPosition='right' label={{ content: 'eth' }} onChange={onInputChange} />
                    </Form.Field>
                    <Form.Field>
                        <label>Minimum Contibution</label>
                        <Input placeholder='Minimum Contibution' value={form.minimumContribution} name="minimumContribution" labelPosition='right' label={{ content: 'eth' }} onChange={onInputChange} />
                    </Form.Field>
                    <Button type='submit' primary onClick={onSubmit}>Submit</Button>
                </Form>
            </Layout>
        </div>
    )
}
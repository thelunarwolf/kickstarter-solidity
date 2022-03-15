import React, { useState } from 'react';
import { Button, Form, Input, Modal } from 'semantic-ui-react';
import Campaign from './../ethereum/artifacts/contracts/Campaign.sol/Campaign.json';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';

function AddSpendRequestModal({ open, onClose, campaignAddress }) {
    const [form, setForm] = useState({
        description: '',
        recipient: '',
        fundValue: 0,
    });

    const onInputChange = (ev) => {
        const { name, value } = ev.target;
        setForm({
            ...form,
            [name]: value,
        });
    }

    const onSaveHandler = async () => {
        const web3Modal = new Web3Modal({ network: 'hardhat' });
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(campaignAddress, Campaign.abi, signer);
        try {
            const request = await contract.createSpendRequest(form.recipient, ethers.utils.parseEther(form.fundValue), form.description, {
                gasLimit: 30000000,
            });
            console.log(request);
            onClose();
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <Modal
            onClose={() => onClose(false)}
            onOpen={() => onSave(true)}
            open={open}
        >
            <Modal.Header>Add Spend Request</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <label>Description</label>
                        <Input placeholder='Description' value={form.description} name="description" onChange={onInputChange} />
                    </Form.Field>
                    <Form.Field>
                        <label>Recipient</label>
                        <Input placeholder='Recipient' value={form.recipient} name="recipient" onChange={onInputChange} />
                    </Form.Field>
                    <Form.Field>
                        <label>Payment</label>
                        <Input placeholder='Payment' value={form.fundValue} name="fundValue" labelPosition='right' label={{ content: 'eth' }} onChange={onInputChange} />
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => onClose(false)}>Cancel</Button>
                <Button onClick={() => onSaveHandler()} positive>
                    Save
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

export default AddSpendRequestModal;

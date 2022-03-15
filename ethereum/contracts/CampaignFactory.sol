//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Campaign.sol";

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaigns(
        uint256 _minimumValue,
        uint256 _fundRequest,
        string memory _description,
        string memory _title
    ) public {
        address newCampaign = address(
            new Campaign(
                msg.sender,
                _minimumValue,
                _fundRequest,
                _description,
                _title
            )
        );
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}

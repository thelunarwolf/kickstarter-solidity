//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Campaign {
    struct SpendRequest {
        string description;
        uint256 value;
        address payable recipient;
        bool isComplete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    struct SpendRequestItem {
        string description;
        uint256 value;
        address payable recipient;
        bool isComplete;
        uint256 approvalCount;
    }

    mapping(uint256 => SpendRequest) public requestMapper;
    uint256 public requestCounter;

    address public manager;
    string public title;
    string public description;
    uint256 public fundRequest;
    uint256 public fundRaised;
    uint256 public minimumContribution;

    mapping(address => bool) public contributors;
    uint256 public contributorCount;

    modifier onlyOwner() {
        require(msg.sender == manager);
        _;
    }

    constructor(
        address _managerAddress,
        uint256 _minimumValue,
        uint256 _fundRequest,
        string memory _description,
        string memory _title
    ) {
        manager = _managerAddress;
        minimumContribution = _minimumValue;
        description = _description;
        title = _title;
        fundRequest = _fundRequest;
        fundRaised = 0;
        requestCounter = 0;
    }

    function contribute() public payable {
        require(
            msg.value >= minimumContribution,
            "Please match minimum contribution"
        );
        fundRaised += msg.value;
        if (!contributors[msg.sender]) {
            contributors[msg.sender] = true;
            contributorCount++;
        }
    }

    function createSpendRequest(
        address payable _recipient,
        uint256 _value,
        string memory _description
    ) public onlyOwner {
        SpendRequest storage req = requestMapper[requestCounter++];
        req.recipient = _recipient;
        req.value = _value;
        req.description = _description;
        req.isComplete = false;
        req.approvalCount = 0;
    }

    function approveSpendRequest(uint256 index) public {
        SpendRequest storage req = requestMapper[index];
        require(
            contributors[msg.sender],
            "Its Necessary to be a contibutor to perform approval"
        );
        require(!req.approvals[msg.sender], "Approval already submitted");
        req.approvals[msg.sender] = true;
        req.approvalCount++;
    }

    function finalizeRequest(uint256 index) public payable onlyOwner {
        SpendRequest storage req = requestMapper[index];
        require(
            req.approvalCount > (contributorCount / 2),
            "Minimum Approval not attained"
        );
        require(!req.isComplete, "Request is already completed");
        req.recipient.transfer(req.value);
        req.isComplete = true;
    }

    function fetchSpendRequest()
        public
        view
        returns (SpendRequestItem[] memory)
    {
        SpendRequestItem[] memory items = new SpendRequestItem[](
            requestCounter
        );
        for (uint256 i = 0; i < requestCounter; i++) {
            uint256 currentId = i;
            SpendRequestItem memory currentItem = SpendRequestItem({
                description: requestMapper[currentId].description,
                value: requestMapper[currentId].value,
                recipient: requestMapper[currentId].recipient,
                isComplete: requestMapper[currentId].isComplete,
                approvalCount: requestMapper[currentId].approvalCount
            });
            items[i] = currentItem;
        }
        return items;
    }

    function getCampaignData()
        public
        view
        returns (
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            address
        )
    {
        return (
            title,
            description,
            fundRequest,
            fundRaised,
            minimumContribution,
            requestCounter,
            contributorCount,
            manager
        );
    }
}

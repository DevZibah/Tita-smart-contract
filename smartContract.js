```// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LiquidityPool {
    struct Proposal {
        address creator;
        uint256 amount;
        bool executed;
        string description;
        // mapping(address => bool) votes;
    }
     struct DepositLog {
        address investor;
        uint256 amount;
        uint256 timestamp;
    }
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    mapping(address => uint256) public balances;
    DepositLog[] public depositLogs;
    mapping(address => mapping(uint256 => bool)) public voted;

    event ProposalCreated(uint256 proposalId, address creator, uint256 amount);
    event Voted(uint256 proposalId, address voter);
    event ProposalExecuted(uint256 proposalId, address creator);
mapping(uint256 => Vote[]) public proposalVotes;
    function deposit() external payable {
        balances[msg.sender] += msg.value;
        depositLogs.push(DepositLog(msg.sender, msg.value,block.timestamp));
    }
struct Vote {
    uint256 proposalId;
    address voter;
    uint256 timestamp;
}
    function createProposal(uint256 amount,string memory desc) external {
        require(amount > 0, "Invalid proposal amount");
        // require(balances[msg.sender] >= amount, "Insufficient balance");

        proposalCount++;
        proposals[proposalCount] = Proposal(msg.sender, amount, false,desc);
        emit ProposalCreated(proposalCount, msg.sender, amount);
    }

    function vote(uint256 proposalId) external {
        require(!voted[msg.sender][proposalId], "Already voted");

        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");

        // proposal.votes[msg.sender] = true;
        voted[msg.sender][proposalId] = true;
        emit Voted(proposalId, msg.sender);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");

        uint256 voteCount = 0;
        uint256 totalBalance = balances[msg.sender];

        // for (uint256 i = 0; i < proposalCount; i++) {
        //     if (proposals[i].votes[msg.sender]) {
        //         voteCount++;
        //     }
        // }

        require(
            (voteCount * 2) >= (totalBalance / 10),
            "Insufficient votes"
        );

        proposal.executed = true;
        balances[proposal.creator] += proposal.amount;
        emit ProposalExecuted(proposalId, proposal.creator);
    }

    function repayLoan(uint256 proposalId) external payable {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.executed, "Proposal not executed");
        require(msg.value == (proposal.amount * 103) / 100, "Invalid repayment amount");

        balances[msg.sender] -= proposal.amount;
        balances[proposal.creator] -= proposal.amount;
    }
    function getAllDeposits() external view returns (DepositLog[] memory) {
        return depositLogs;
    }
    function getDepositsByAddress(address customer) external view returns (DepositLog[] memory) {
        uint256 depositCount = 0;
        for (uint256 i = 0; i < depositLogs.length; i++) {
            if (depositLogs[i].investor == customer) {
                depositCount++;
            }
        }

        DepositLog[] memory customerDeposits = new DepositLog[](depositCount);
        uint256 index = 0;
        for (uint256 i = 0; i < depositLogs.length; i++) {
            if (depositLogs[i].investor == customer) {
                customerDeposits[index] = depositLogs[i];
                index++;
            }
        }

        return customerDeposits;
    }
     function getAllProposals() external view returns (Proposal[] memory) {
        Proposal[] memory allProposals = new Proposal[](proposalCount);
        for (uint256 i = 1; i <= proposalCount; i++) {
            allProposals[i - 1] = proposals[i];
        }
        return allProposals;
    }
    function getContractBalance() external view returns (uint256) {
    return address(this).balance;
}
function getAllVotes() external view returns (Vote[] memory) {
    uint256 totalVotes = 0;
    for (uint256 i = 1; i <= proposalCount; i++) {
        totalVotes += proposalVotes[i].length;
    }

    Vote[] memory allVotes = new Vote[](totalVotes);
    uint256 index = 0;
    for (uint256 i = 1; i <= proposalCount; i++) {
        Vote[] storage votes = proposalVotes[i];
        for (uint256 j = 0; j < votes.length; j++) {
            allVotes[index] = votes[j];
            index++;
        }
    }

    return allVotes;
}
function getVotesByProposalId(uint256 proposalId) external view returns (Vote[] memory) {
    require(proposalId <= proposalCount, "Invalid proposal ID");

    return proposalVotes[proposalId];
}
}
```

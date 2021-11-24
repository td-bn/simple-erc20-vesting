// SPDX-License-Identifier: WTFPL

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
    Using block timestamps to work with time
    Should be accurate over longer periods of time
    Can also use block numbers and average block times to achieve the same effect

    RBAC seemed like an overkill for beneficiary roles since it does the same this 
    in the background (using mappings)
*/


/* solhint-disable not-rely-on-time */
contract Token is ERC20Capped, Ownable {

    event WithdrawVested(address indexed beneficiary, uint256 amount);

    mapping(address => bool) public beneficiary;

    uint256 public immutable vestingStarts;
    uint256 public immutable amountPerMin;
   
    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _cap, 
        address[] memory _benefieciaries
        )
        ERC20(_name, _symbol) 
        ERC20Capped(_cap) 
    {
        vestingStarts = block.timestamp;
        amountPerMin = _cap / (_benefieciaries.length * 365 * 24 * 60);
        
        for (uint i=0; i<_benefieciaries.length; i++) {
            beneficiary[_benefieciaries[i]] = true;
        }
    }

    function withdraw(uint256 amount) external {
        require(amount <= checkDue(msg.sender), "XYZ: incorrect amount");
        _mint(msg.sender, amount);

        emit WithdrawVested(msg.sender, amount);
    }

    function checkDue(address forBeneficiary) public view returns (uint256) {
        require(beneficiary[forBeneficiary], "XYZ: not a beneficiary");
        uint256 total = ((block.timestamp - vestingStarts) / 1 minutes) * amountPerMin;
        return total - balanceOf(forBeneficiary);
    }
}


/**
    Arguments for Remix deploy:
    "Edufied", "XYZ", 100000000, ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2"]
*/
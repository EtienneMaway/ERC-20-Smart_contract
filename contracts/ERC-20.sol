// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract ERC20Token {
    string public name; // The name of the ERC-20 token.
    string public symbol; // The symbol (ticker) of the ERC-20 token.
    uint8 public decimals; // The number of decimal places for the token.
    uint public totalSupply; // Total supply of the ERC-20 token.
    address public owner; // Address of the contract owner.

    // Mapping to store balances for each address.
    mapping(address => uint) public balanceOf;

    // Mapping to store approved allowances for transfers.
    mapping(address => mapping(address => uint)) public allowance;

    // Event emitted on successful transfer of tokens.
    event Transfer(address indexed from, address indexed to, uint amount);

    // Event emitted on approval of token transfer allowance.
    event Approve(address owner, address spender, uint value);

    // Constructor to initialize the ERC-20 token with specified parameters.
    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint _initial_supply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _initial_supply * (10 ** uint(decimals));
        balanceOf[msg.sender] = totalSupply;
        owner = msg.sender;
    }

    // Function to transfer tokens from the sender to another address.
    function transfer(address _to, uint _value) public returns (bool success) {
        require(_to != address(0), 'Invalid address');
        require(balanceOf[msg.sender] > _value, 'Insufficient balance');

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // Function to check if an allowance is set for a specific spender.
    function getAllowance(
        address _owner,
        address _spender
    ) public view returns (bool success) {
        return allowance[_owner][_spender] > 0;
    }

    // Function to approve a specific address to spend tokens on behalf of the owner.
    function approve(address _to, uint _value) public returns (bool success) {
        allowance[msg.sender][_to] = _value;
        emit Approve(msg.sender, _to, _value);
        return true;
    }

    // Function to transfer tokens from one address to another on behalf of the owner.
    function tranferFrom(
        
        address _from,
        address _to,
        uint _value
    ) public returns (bool) {
        require(_to != address(0), 'Invalid address');
        require(
            _value < balanceOf[_from],
            'Insufficient balance from the token owner'
        );
        require(allowance[_from][msg.sender] >= _value, 'Allowance exceeded');

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }
}

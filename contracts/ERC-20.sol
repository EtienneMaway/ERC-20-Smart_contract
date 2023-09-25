// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract ERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint public totalSupply;

    mapping (address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    event Transfer(address indexed from, address indexed to, uint amount);

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _initial_supply
    ) {
        require(_initial_supply > 0,"Initial supply must be positive");
        require(_decimals > 0,"The decimals must be positive");
        name = _name;
        symbol = _symbol;
        decimals=_decimals;
        totalSupply = _initial_supply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) public returns(bool) {
        require(_to != address(0), "Invalid address");
        require(balanceOf[msg.sender] > _value, "Insufficient balance");

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _to, uint256 _value) public returns(bool){
        allowance[msg.sender][_to] = _value;
        return true;
    }

    function tranferFrom(address _from, address _to, uint256 _value) public returns(bool) {
        require(_from != address(0) && _to != address(0), "Invalid address");
        require(_value < balanceOf[_from], "Insufficient balance from the token owner");
        require(allowance[_from][msg.sender] <= _value, "Allowance exceeded");

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;

        emit Transfer( _from, _to, _value);
        return true;

    }
    
}
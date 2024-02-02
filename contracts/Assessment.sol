// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    
    uint256 public deluxeSlots = 10;
    uint256 public premiumSlots = 20;
    uint256 public basicSlots = 50;
    
    uint256 public deluxePrice = 200;
    uint256 public premiumPrice = 120;
    uint256 public basicPrice = 50;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event RoomBooked(address indexed customer, string roomType, uint256 price);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        balance += msg.value;
        emit Deposit(msg.value);
    }

    
    function bookRoom(string memory _roomType) public payable {
        require(msg.value > 0, "Booking amount must be greater than 0");
        
        if (keccak256(abi.encodePacked(_roomType)) == keccak256(abi.encodePacked("deluxe"))) {
            require(deluxeSlots > 0, "No deluxe rooms available");
            require(msg.value >= deluxePrice, "Insufficient funds to book deluxe room");
            deluxeSlots--;
            balance -= msg.value;
            emit RoomBooked(msg.sender, _roomType, deluxePrice);
        } else if (keccak256(abi.encodePacked(_roomType)) == keccak256(abi.encodePacked("premium"))) {
            require(premiumSlots > 0, "No premium rooms available");
            require(msg.value >= premiumPrice, "Insufficient funds to book premium room");
            premiumSlots--;
            balance -= msg.value; 
            emit RoomBooked(msg.sender, _roomType, premiumPrice);
        } else if (keccak256(abi.encodePacked(_roomType)) == keccak256(abi.encodePacked("basic"))) {
            require(basicSlots > 0, "No basic rooms available");
            require(msg.value >= basicPrice, "Insufficient funds to book basic room");
            basicSlots--;
            balance -= msg.value;
            emit RoomBooked(msg.sender, _roomType, basicPrice);
        } else {
            revert("Invalid room type");
        }
    }
}

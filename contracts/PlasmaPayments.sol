// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function decimals() external view returns (uint8);
}

contract PlasmaPayments {
    struct Contact {
        string name;
        address addr;
        bool exists;
    }

    struct Payment {
        address from;
        address to;
        string fromName;
        string toName;
        uint256 amount;
        uint256 timestamp;
    }

    IERC20 public usdt;

    mapping(address => string) public addressToName;
    mapping(string => address) public nameToAddress;
    mapping(address => Payment[]) public paymentHistory;

    address[] public registeredUsers;

    event UserRegistered(address indexed user, string name);
    event PaymentSent(
        address indexed from,
        address indexed to,
        string fromName,
        string toName,
        uint256 amount,
        uint256 timestamp
    );

    constructor(address _usdtAddress) {
        usdt = IERC20(_usdtAddress);
    }

    function register(string calldata name) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(nameToAddress[name] == address(0), "Name already taken");

        // Clear old name if re-registering
        string memory oldName = addressToName[msg.sender];
        if (bytes(oldName).length > 0) {
            delete nameToAddress[oldName];
        } else {
            registeredUsers.push(msg.sender);
        }

        addressToName[msg.sender] = name;
        nameToAddress[name] = msg.sender;

        emit UserRegistered(msg.sender, name);
    }

    function sendByName(string calldata toName, uint256 amount) external {
        require(amount > 0, "Must send some USDT");
        address to = nameToAddress[toName];
        require(to != address(0), "Recipient not found");
        require(to != msg.sender, "Cannot send to yourself");

        string memory fromName = addressToName[msg.sender];
        require(bytes(fromName).length > 0, "Register your name first");

        require(usdt.transferFrom(msg.sender, to, amount), "USDT transfer failed");

        Payment memory p = Payment({
            from: msg.sender,
            to: to,
            fromName: fromName,
            toName: toName,
            amount: amount,
            timestamp: block.timestamp
        });

        paymentHistory[msg.sender].push(p);
        paymentHistory[to].push(p);

        emit PaymentSent(msg.sender, to, fromName, toName, amount, block.timestamp);
    }

    function getContacts() external view returns (string[] memory names, address[] memory addrs) {
        uint256 len = registeredUsers.length;
        names = new string[](len);
        addrs = new address[](len);
        for (uint256 i = 0; i < len; i++) {
            addrs[i] = registeredUsers[i];
            names[i] = addressToName[registeredUsers[i]];
        }
    }

    function getMyHistory() external view returns (Payment[] memory) {
        return paymentHistory[msg.sender];
    }

    function getHistoryCount(address user) external view returns (uint256) {
        return paymentHistory[user].length;
    }
}

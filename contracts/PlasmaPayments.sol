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

    struct Request {
        uint256 id;
        address requester;
        address payer;
        string requesterName;
        string payerName;
        uint256 amount;
        uint256 timestamp;
        bool fulfilled;
        bool cancelled;
    }

    IERC20 public usdt;

    mapping(address => string) public addressToName;
    mapping(string => address) public nameToAddress;
    mapping(address => Payment[]) public paymentHistory;

    Request[] public allRequests;
    mapping(address => uint256[]) public requestsForPayer;
    mapping(address => uint256[]) public requestsByRequester;

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
    event RequestCreated(uint256 indexed id, address indexed requester, address indexed payer, uint256 amount);
    event RequestFulfilled(uint256 indexed id);

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

    function requestByName(string calldata payerName, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        address payer = nameToAddress[payerName];
        require(payer != address(0), "Payer not found");
        require(payer != msg.sender, "Cannot request from yourself");

        string memory reqName = addressToName[msg.sender];
        require(bytes(reqName).length > 0, "Register your name first");

        uint256 id = allRequests.length;
        allRequests.push(Request({
            id: id,
            requester: msg.sender,
            payer: payer,
            requesterName: reqName,
            payerName: payerName,
            amount: amount,
            timestamp: block.timestamp,
            fulfilled: false,
            cancelled: false
        }));

        requestsForPayer[payer].push(id);
        requestsByRequester[msg.sender].push(id);

        emit RequestCreated(id, msg.sender, payer, amount);
    }

    function fulfillRequest(uint256 requestId) external {
        Request storage r = allRequests[requestId];
        require(!r.fulfilled && !r.cancelled, "Request already resolved");
        require(r.payer == msg.sender, "Only the payer can fulfil");

        r.fulfilled = true;

        require(usdt.transferFrom(msg.sender, r.requester, r.amount), "USDT transfer failed");

        Payment memory p = Payment({
            from: msg.sender,
            to: r.requester,
            fromName: r.payerName,
            toName: r.requesterName,
            amount: r.amount,
            timestamp: block.timestamp
        });
        paymentHistory[msg.sender].push(p);
        paymentHistory[r.requester].push(p);

        emit RequestFulfilled(requestId);
        emit PaymentSent(msg.sender, r.requester, r.payerName, r.requesterName, r.amount, block.timestamp);
    }

    function getMyPendingRequests() external view returns (Request[] memory) {
        uint256[] storage ids = requestsForPayer[msg.sender];
        uint256 count = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (!allRequests[ids[i]].fulfilled && !allRequests[ids[i]].cancelled) count++;
        }
        Request[] memory pending = new Request[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (!allRequests[ids[i]].fulfilled && !allRequests[ids[i]].cancelled) {
                pending[j++] = allRequests[ids[i]];
            }
        }
        return pending;
    }

    function getMyOutgoingRequests() external view returns (Request[] memory) {
        uint256[] storage ids = requestsByRequester[msg.sender];
        uint256 count = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (!allRequests[ids[i]].fulfilled && !allRequests[ids[i]].cancelled) count++;
        }
        Request[] memory outgoing = new Request[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            if (!allRequests[ids[i]].fulfilled && !allRequests[ids[i]].cancelled) {
                outgoing[j++] = allRequests[ids[i]];
            }
        }
        return outgoing;
    }
}

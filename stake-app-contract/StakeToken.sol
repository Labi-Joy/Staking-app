// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title StakeToken (STAKE)
 * @dev ERC20 token for staking in the Labi Stake App
 * Features:
 * - Public minting for testing
 * - Standard ERC20 functionality
 * - Decimals: 18
 * - Symbol: STAKE
 */
contract StakeToken {
    string public name = "Stake Token";
    string public symbol = "STAKE";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    
    /**
     * @dev Mint tokens to any address (public minting for testing)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than zero");
        
        totalSupply += amount;
        balanceOf[to] += amount;
        
        emit Transfer(address(0), to, amount);
        emit Mint(to, amount);
    }
    
    /**
     * @dev Mint tokens to the caller
     * @param amount Amount of tokens to mint
     */
    function mintToSelf(uint256 amount) external {
        mint(msg.sender, amount);
    }
    
    /**
     * @dev Transfer tokens
     * @param to Address to transfer to
     * @param amount Amount to transfer
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    /**
     * @dev Approve spender to spend tokens
     * @param spender Address to approve
     * @param amount Amount to approve
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfer tokens from one address to another
     * @param from Address to transfer from
     * @param to Address to transfer to
     * @param amount Amount to transfer
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(from != address(0), "Cannot transfer from zero address");
        require(to != address(0), "Cannot transfer to zero address");
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
    
    /**
     * @dev Increase allowance
     * @param spender Address to increase allowance for
     * @param addedValue Amount to increase allowance by
     */
    function increaseAllowance(address spender, uint256 addedValue) external returns (bool) {
        allowance[msg.sender][spender] += addedValue;
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }
    
    /**
     * @dev Decrease allowance
     * @param spender Address to decrease allowance for
     * @param subtractedValue Amount to decrease allowance by
     */
    function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool) {
        require(allowance[msg.sender][spender] >= subtractedValue, "Decreased allowance below zero");
        allowance[msg.sender][spender] -= subtractedValue;
        emit Approval(msg.sender, spender, allowance[msg.sender][spender]);
        return true;
    }
    
    /**
     * @dev Get balance of an address
     * @param account Address to check balance for
     */
    function getBalance(address account) external view returns (uint256) {
        return balanceOf[account];
    }
    
    /**
     * @dev Get allowance amount
     * @param owner Owner address
     * @param spender Spender address
     */
    function getAllowance(address owner, address spender) external view returns (uint256) {
        return allowance[owner][spender];
    }
}
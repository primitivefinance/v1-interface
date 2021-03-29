import ethers from 'ethers'
// import ERC20 from '@primitivefi/contracts/artifacts/contracts/option/primitives/ERC20.sol/ERC20.json'

const ERC20 = {
  address: '0x11E7aC3e542790C9A7E82FF7D85E0e62b90c63f5',
  abi: [
    {
      inputs: [],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'Approval',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'from',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'value',
          type: 'uint256',
        },
      ],
      name: 'Transfer',
      type: 'event',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'owner',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
      ],
      name: 'allowance',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'approve',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'account',
          type: 'address',
        },
      ],
      name: 'balanceOf',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'uint256',
          name: 'wad',
          type: 'uint256',
        },
      ],
      name: 'burn',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'decimals',
      outputs: [
        {
          internalType: 'uint8',
          name: '',
          type: 'uint8',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'subtractedValue',
          type: 'uint256',
        },
      ],
      name: 'decreaseAllowance',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'spender',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'addedValue',
          type: 'uint256',
        },
      ],
      name: 'increaseAllowance',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'to',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'wad',
          type: 'uint256',
        },
      ],
      name: 'mint',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'name',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'symbol',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'totalSupply',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'transfer',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'recipient',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'transferFrom',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
  transactionHash:
    '0xf21a9b0f2ae00b0c1d908dbfb10aad7ed2d5291029fcaec1c0ebb49b6a5a7aa1',
  receipt: {
    to: null,
    from: '0xE7D58d8554Eb0D5B5438848Af32Bf33EbdE477E7',
    contractAddress: '0x11E7aC3e542790C9A7E82FF7D85E0e62b90c63f5',
    transactionIndex: 0,
    gasUsed: '845465',
    logsBloom:
      '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    blockHash:
      '0x4258224d02083cdfb514a23b77e03ef94484ad1d8bdb4829680b2e26fadc3a64',
    transactionHash:
      '0xf21a9b0f2ae00b0c1d908dbfb10aad7ed2d5291029fcaec1c0ebb49b6a5a7aa1',
    logs: [],
    blockNumber: 24086399,
    cumulativeGasUsed: '845465',
    status: 1,
    byzantium: true,
  },
  args: [],
  solcInputHash: '841d80cdef5e9c9868692577938e9b42',
  metadata:
    '{"compiler":{"version":"0.7.6+commit.7338295f"},"language":"Solidity","output":{"abi":[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}],"devdoc":{"kind":"dev","methods":{"allowance(address,address)":{"details":"See {IERC20-allowance}."},"approve(address,uint256)":{"details":"See {IERC20-approve}. Requirements: - `spender` cannot be the zero address."},"balanceOf(address)":{"details":"See {IERC20-balanceOf}."},"decimals()":{"details":"Returns the number of decimals used to get its user representation. For example, if `decimals` equals `2`, a balance of `505` tokens should be displayed to a user as `5,05` (`505 / 10 ** 2`). Tokens usually opt for a value of 18, imitating the relationship between Ether and Wei. This is the value {ERC20} uses, unless {_setupDecimals} is called. NOTE: This information is only used for _display_ purposes: it in no way affects any of the arithmetic of the contract, including {IERC20-balanceOf} and {IERC20-transfer}."},"decreaseAllowance(address,uint256)":{"details":"Atomically decreases the allowance granted to `spender` by the caller. This is an alternative to {approve} that can be used as a mitigation for problems described in {IERC20-approve}. Emits an {Approval} event indicating the updated allowance. Requirements: - `spender` cannot be the zero address. - `spender` must have allowance for the caller of at least `subtractedValue`."},"increaseAllowance(address,uint256)":{"details":"Atomically increases the allowance granted to `spender` by the caller. This is an alternative to {approve} that can be used as a mitigation for problems described in {IERC20-approve}. Emits an {Approval} event indicating the updated allowance. Requirements: - `spender` cannot be the zero address."},"name()":{"details":"Returns the name of the token."},"symbol()":{"details":"Returns the symbol of the token, usually a shorter version of the name."},"totalSupply()":{"details":"See {IERC20-totalSupply}."},"transfer(address,uint256)":{"details":"See {IERC20-transfer}. Requirements: - `recipient` cannot be the zero address. - the caller must have a balance of at least `amount`."},"transferFrom(address,address,uint256)":{"details":"See {IERC20-transferFrom}. Emits an {Approval} event indicating the updated allowance. This is not required by the EIP. See the note at the beginning of {ERC20}. Requirements: - `sender` and `recipient` cannot be the zero address. - `sender` must have a balance of at least `amount`. - the caller must have allowance for ``sender``\'s tokens of at least `amount`."}},"version":1},"userdoc":{"kind":"user","methods":{},"version":1}},"settings":{"compilationTarget":{"contracts/Token.sol":"Token"},"evmVersion":"istanbul","libraries":{},"metadata":{"bytecodeHash":"ipfs","useLiteralContent":true},"optimizer":{"enabled":true,"runs":400},"remappings":[]},"sources":{"@openzeppelin/contracts/math/SafeMath.sol":{"content":"// SPDX-License-Identifier: MIT\\n\\npragma solidity >=0.6.0 <0.8.0;\\n\\n/**\\n * @dev Wrappers over Solidity\'s arithmetic operations with added overflow\\n * checks.\\n *\\n * Arithmetic operations in Solidity wrap on overflow. This can easily result\\n * in bugs, because programmers usually assume that an overflow raises an\\n * error, which is the standard behavior in high level programming languages.\\n * `SafeMath` restores this intuition by reverting the transaction when an\\n * operation overflows.\\n *\\n * Using this library instead of the unchecked operations eliminates an entire\\n * class of bugs, so it\'s recommended to use it always.\\n */\\nlibrary SafeMath {\\n    /**\\n     * @dev Returns the addition of two unsigned integers, with an overflow flag.\\n     *\\n     * _Available since v3.4._\\n     */\\n    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {\\n        uint256 c = a + b;\\n        if (c < a) return (false, 0);\\n        return (true, c);\\n    }\\n\\n    /**\\n     * @dev Returns the substraction of two unsigned integers, with an overflow flag.\\n     *\\n     * _Available since v3.4._\\n     */\\n    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {\\n        if (b > a) return (false, 0);\\n        return (true, a - b);\\n    }\\n\\n    /**\\n     * @dev Returns the multiplication of two unsigned integers, with an overflow flag.\\n     *\\n     * _Available since v3.4._\\n     */\\n    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {\\n        // Gas optimization: this is cheaper than requiring \'a\' not being zero, but the\\n        // benefit is lost if \'b\' is also tested.\\n        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522\\n        if (a == 0) return (true, 0);\\n        uint256 c = a * b;\\n        if (c / a != b) return (false, 0);\\n        return (true, c);\\n    }\\n\\n    /**\\n     * @dev Returns the division of two unsigned integers, with a division by zero flag.\\n     *\\n     * _Available since v3.4._\\n     */\\n    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {\\n        if (b == 0) return (false, 0);\\n        return (true, a / b);\\n    }\\n\\n    /**\\n     * @dev Returns the remainder of dividing two unsigned integers, with a division by zero flag.\\n     *\\n     * _Available since v3.4._\\n     */\\n    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {\\n        if (b == 0) return (false, 0);\\n        return (true, a % b);\\n    }\\n\\n    /**\\n     * @dev Returns the addition of two unsigned integers, reverting on\\n     * overflow.\\n     *\\n     * Counterpart to Solidity\'s `+` operator.\\n     *\\n     * Requirements:\\n     *\\n     * - Addition cannot overflow.\\n     */\\n    function add(uint256 a, uint256 b) internal pure returns (uint256) {\\n        uint256 c = a + b;\\n        require(c >= a, \\"SafeMath: addition overflow\\");\\n        return c;\\n    }\\n\\n    /**\\n     * @dev Returns the subtraction of two unsigned integers, reverting on\\n     * overflow (when the result is negative).\\n     *\\n     * Counterpart to Solidity\'s `-` operator.\\n     *\\n     * Requirements:\\n     *\\n     * - Subtraction cannot overflow.\\n     */\\n    function sub(uint256 a, uint256 b) internal pure returns (uint256) {\\n        require(b <= a, \\"SafeMath: subtraction overflow\\");\\n        return a - b;\\n    }\\n\\n    /**\\n     * @dev Returns the multiplication of two unsigned integers, reverting on\\n     * overflow.\\n     *\\n     * Counterpart to Solidity\'s `*` operator.\\n     *\\n     * Requirements:\\n     *\\n     * - Multiplication cannot overflow.\\n     */\\n    function mul(uint256 a, uint256 b) internal pure returns (uint256) {\\n        if (a == 0) return 0;\\n        uint256 c = a * b;\\n        require(c / a == b, \\"SafeMath: multiplication overflow\\");\\n        return c;\\n    }\\n\\n    /**\\n     * @dev Returns the integer division of two unsigned integers, reverting on\\n     * division by zero. The result is rounded towards zero.\\n     *\\n     * Counterpart to Solidity\'s `/` operator. Note: this function uses a\\n     * `revert` opcode (which leaves remaining gas untouched) while Solidity\\n     * uses an invalid opcode to revert (consuming all remaining gas).\\n     *\\n     * Requirements:\\n     *\\n     * - The divisor cannot be zero.\\n     */\\n    function div(uint256 a, uint256 b) internal pure returns (uint256) {\\n        require(b > 0, \\"SafeMath: division by zero\\");\\n        return a / b;\\n    }\\n\\n    /**\\n     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),\\n     * reverting when dividing by zero.\\n     *\\n     * Counterpart to Solidity\'s `%` operator. This function uses a `revert`\\n     * opcode (which leaves remaining gas untouched) while Solidity uses an\\n     * invalid opcode to revert (consuming all remaining gas).\\n     *\\n     * Requirements:\\n     *\\n     * - The divisor cannot be zero.\\n     */\\n    function mod(uint256 a, uint256 b) internal pure returns (uint256) {\\n        require(b > 0, \\"SafeMath: modulo by zero\\");\\n        return a % b;\\n    }\\n\\n    /**\\n     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on\\n     * overflow (when the result is negative).\\n     *\\n     * CAUTION: This function is deprecated because it requires allocating memory for the error\\n     * message unnecessarily. For custom revert reasons use {trySub}.\\n     *\\n     * Counterpart to Solidity\'s `-` operator.\\n     *\\n     * Requirements:\\n     *\\n     * - Subtraction cannot overflow.\\n     */\\n    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {\\n        require(b <= a, errorMessage);\\n        return a - b;\\n    }\\n\\n    /**\\n     * @dev Returns the integer division of two unsigned integers, reverting with custom message on\\n     * division by zero. The result is rounded towards zero.\\n     *\\n     * CAUTION: This function is deprecated because it requires allocating memory for the error\\n     * message unnecessarily. For custom revert reasons use {tryDiv}.\\n     *\\n     * Counterpart to Solidity\'s `/` operator. Note: this function uses a\\n     * `revert` opcode (which leaves remaining gas untouched) while Solidity\\n     * uses an invalid opcode to revert (consuming all remaining gas).\\n     *\\n     * Requirements:\\n     *\\n     * - The divisor cannot be zero.\\n     */\\n    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {\\n        require(b > 0, errorMessage);\\n        return a / b;\\n    }\\n\\n    /**\\n     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),\\n     * reverting with custom message when dividing by zero.\\n     *\\n     * CAUTION: This function is deprecated because it requires allocating memory for the error\\n     * message unnecessarily. For custom revert reasons use {tryMod}.\\n     *\\n     * Counterpart to Solidity\'s `%` operator. This function uses a `revert`\\n     * opcode (which leaves remaining gas untouched) while Solidity uses an\\n     * invalid opcode to revert (consuming all remaining gas).\\n     *\\n     * Requirements:\\n     *\\n     * - The divisor cannot be zero.\\n     */\\n    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {\\n        require(b > 0, errorMessage);\\n        return a % b;\\n    }\\n}\\n","keccak256":"0xcc78a17dd88fa5a2edc60c8489e2f405c0913b377216a5b26b35656b2d0dab52","license":"MIT"},"@openzeppelin/contracts/token/ERC20/ERC20.sol":{"content":"// SPDX-License-Identifier: MIT\\n\\npragma solidity >=0.6.0 <0.8.0;\\n\\nimport \\"../../utils/Context.sol\\";\\nimport \\"./IERC20.sol\\";\\nimport \\"../../math/SafeMath.sol\\";\\n\\n/**\\n * @dev Implementation of the {IERC20} interface.\\n *\\n * This implementation is agnostic to the way tokens are created. This means\\n * that a supply mechanism has to be added in a derived contract using {_mint}.\\n * For a generic mechanism see {ERC20PresetMinterPauser}.\\n *\\n * TIP: For a detailed writeup see our guide\\n * https://forum.zeppelin.solutions/t/how-to-implement-erc20-supply-mechanisms/226[How\\n * to implement supply mechanisms].\\n *\\n * We have followed general OpenZeppelin guidelines: functions revert instead\\n * of returning `false` on failure. This behavior is nonetheless conventional\\n * and does not conflict with the expectations of ERC20 applications.\\n *\\n * Additionally, an {Approval} event is emitted on calls to {transferFrom}.\\n * This allows applications to reconstruct the allowance for all accounts just\\n * by listening to said events. Other implementations of the EIP may not emit\\n * these events, as it isn\'t required by the specification.\\n *\\n * Finally, the non-standard {decreaseAllowance} and {increaseAllowance}\\n * functions have been added to mitigate the well-known issues around setting\\n * allowances. See {IERC20-approve}.\\n */\\ncontract ERC20 is Context, IERC20 {\\n    using SafeMath for uint256;\\n\\n    mapping (address => uint256) private _balances;\\n\\n    mapping (address => mapping (address => uint256)) private _allowances;\\n\\n    uint256 private _totalSupply;\\n\\n    string private _name;\\n    string private _symbol;\\n    uint8 private _decimals;\\n\\n    /**\\n     * @dev Sets the values for {name} and {symbol}, initializes {decimals} with\\n     * a default value of 18.\\n     *\\n     * To select a different value for {decimals}, use {_setupDecimals}.\\n     *\\n     * All three of these values are immutable: they can only be set once during\\n     * construction.\\n     */\\n    constructor (string memory name_, string memory symbol_) public {\\n        _name = name_;\\n        _symbol = symbol_;\\n        _decimals = 18;\\n    }\\n\\n    /**\\n     * @dev Returns the name of the token.\\n     */\\n    function name() public view virtual returns (string memory) {\\n        return _name;\\n    }\\n\\n    /**\\n     * @dev Returns the symbol of the token, usually a shorter version of the\\n     * name.\\n     */\\n    function symbol() public view virtual returns (string memory) {\\n        return _symbol;\\n    }\\n\\n    /**\\n     * @dev Returns the number of decimals used to get its user representation.\\n     * For example, if `decimals` equals `2`, a balance of `505` tokens should\\n     * be displayed to a user as `5,05` (`505 / 10 ** 2`).\\n     *\\n     * Tokens usually opt for a value of 18, imitating the relationship between\\n     * Ether and Wei. This is the value {ERC20} uses, unless {_setupDecimals} is\\n     * called.\\n     *\\n     * NOTE: This information is only used for _display_ purposes: it in\\n     * no way affects any of the arithmetic of the contract, including\\n     * {IERC20-balanceOf} and {IERC20-transfer}.\\n     */\\n    function decimals() public view virtual returns (uint8) {\\n        return _decimals;\\n    }\\n\\n    /**\\n     * @dev See {IERC20-totalSupply}.\\n     */\\n    function totalSupply() public view virtual override returns (uint256) {\\n        return _totalSupply;\\n    }\\n\\n    /**\\n     * @dev See {IERC20-balanceOf}.\\n     */\\n    function balanceOf(address account) public view virtual override returns (uint256) {\\n        return _balances[account];\\n    }\\n\\n    /**\\n     * @dev See {IERC20-transfer}.\\n     *\\n     * Requirements:\\n     *\\n     * - `recipient` cannot be the zero address.\\n     * - the caller must have a balance of at least `amount`.\\n     */\\n    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {\\n        _transfer(_msgSender(), recipient, amount);\\n        return true;\\n    }\\n\\n    /**\\n     * @dev See {IERC20-allowance}.\\n     */\\n    function allowance(address owner, address spender) public view virtual override returns (uint256) {\\n        return _allowances[owner][spender];\\n    }\\n\\n    /**\\n     * @dev See {IERC20-approve}.\\n     *\\n     * Requirements:\\n     *\\n     * - `spender` cannot be the zero address.\\n     */\\n    function approve(address spender, uint256 amount) public virtual override returns (bool) {\\n        _approve(_msgSender(), spender, amount);\\n        return true;\\n    }\\n\\n    /**\\n     * @dev See {IERC20-transferFrom}.\\n     *\\n     * Emits an {Approval} event indicating the updated allowance. This is not\\n     * required by the EIP. See the note at the beginning of {ERC20}.\\n     *\\n     * Requirements:\\n     *\\n     * - `sender` and `recipient` cannot be the zero address.\\n     * - `sender` must have a balance of at least `amount`.\\n     * - the caller must have allowance for ``sender``\'s tokens of at least\\n     * `amount`.\\n     */\\n    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {\\n        _transfer(sender, recipient, amount);\\n        _approve(sender, _msgSender(), _allowances[sender][_msgSender()].sub(amount, \\"ERC20: transfer amount exceeds allowance\\"));\\n        return true;\\n    }\\n\\n    /**\\n     * @dev Atomically increases the allowance granted to `spender` by the caller.\\n     *\\n     * This is an alternative to {approve} that can be used as a mitigation for\\n     * problems described in {IERC20-approve}.\\n     *\\n     * Emits an {Approval} event indicating the updated allowance.\\n     *\\n     * Requirements:\\n     *\\n     * - `spender` cannot be the zero address.\\n     */\\n    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {\\n        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].add(addedValue));\\n        return true;\\n    }\\n\\n    /**\\n     * @dev Atomically decreases the allowance granted to `spender` by the caller.\\n     *\\n     * This is an alternative to {approve} that can be used as a mitigation for\\n     * problems described in {IERC20-approve}.\\n     *\\n     * Emits an {Approval} event indicating the updated allowance.\\n     *\\n     * Requirements:\\n     *\\n     * - `spender` cannot be the zero address.\\n     * - `spender` must have allowance for the caller of at least\\n     * `subtractedValue`.\\n     */\\n    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {\\n        _approve(_msgSender(), spender, _allowances[_msgSender()][spender].sub(subtractedValue, \\"ERC20: decreased allowance below zero\\"));\\n        return true;\\n    }\\n\\n    /**\\n     * @dev Moves tokens `amount` from `sender` to `recipient`.\\n     *\\n     * This is internal function is equivalent to {transfer}, and can be used to\\n     * e.g. implement automatic token fees, slashing mechanisms, etc.\\n     *\\n     * Emits a {Transfer} event.\\n     *\\n     * Requirements:\\n     *\\n     * - `sender` cannot be the zero address.\\n     * - `recipient` cannot be the zero address.\\n     * - `sender` must have a balance of at least `amount`.\\n     */\\n    function _transfer(address sender, address recipient, uint256 amount) internal virtual {\\n        require(sender != address(0), \\"ERC20: transfer from the zero address\\");\\n        require(recipient != address(0), \\"ERC20: transfer to the zero address\\");\\n\\n        _beforeTokenTransfer(sender, recipient, amount);\\n\\n        _balances[sender] = _balances[sender].sub(amount, \\"ERC20: transfer amount exceeds balance\\");\\n        _balances[recipient] = _balances[recipient].add(amount);\\n        emit Transfer(sender, recipient, amount);\\n    }\\n\\n    /** @dev Creates `amount` tokens and assigns them to `account`, increasing\\n     * the total supply.\\n     *\\n     * Emits a {Transfer} event with `from` set to the zero address.\\n     *\\n     * Requirements:\\n     *\\n     * - `to` cannot be the zero address.\\n     */\\n    function _mint(address account, uint256 amount) internal virtual {\\n        require(account != address(0), \\"ERC20: mint to the zero address\\");\\n\\n        _beforeTokenTransfer(address(0), account, amount);\\n\\n        _totalSupply = _totalSupply.add(amount);\\n        _balances[account] = _balances[account].add(amount);\\n        emit Transfer(address(0), account, amount);\\n    }\\n\\n    /**\\n     * @dev Destroys `amount` tokens from `account`, reducing the\\n     * total supply.\\n     *\\n     * Emits a {Transfer} event with `to` set to the zero address.\\n     *\\n     * Requirements:\\n     *\\n     * - `account` cannot be the zero address.\\n     * - `account` must have at least `amount` tokens.\\n     */\\n    function _burn(address account, uint256 amount) internal virtual {\\n        require(account != address(0), \\"ERC20: burn from the zero address\\");\\n\\n        _beforeTokenTransfer(account, address(0), amount);\\n\\n        _balances[account] = _balances[account].sub(amount, \\"ERC20: burn amount exceeds balance\\");\\n        _totalSupply = _totalSupply.sub(amount);\\n        emit Transfer(account, address(0), amount);\\n    }\\n\\n    /**\\n     * @dev Sets `amount` as the allowance of `spender` over the `owner` s tokens.\\n     *\\n     * This internal function is equivalent to `approve`, and can be used to\\n     * e.g. set automatic allowances for certain subsystems, etc.\\n     *\\n     * Emits an {Approval} event.\\n     *\\n     * Requirements:\\n     *\\n     * - `owner` cannot be the zero address.\\n     * - `spender` cannot be the zero address.\\n     */\\n    function _approve(address owner, address spender, uint256 amount) internal virtual {\\n        require(owner != address(0), \\"ERC20: approve from the zero address\\");\\n        require(spender != address(0), \\"ERC20: approve to the zero address\\");\\n\\n        _allowances[owner][spender] = amount;\\n        emit Approval(owner, spender, amount);\\n    }\\n\\n    /**\\n     * @dev Sets {decimals} to a value other than the default one of 18.\\n     *\\n     * WARNING: This function should only be called from the constructor. Most\\n     * applications that interact with token contracts will not expect\\n     * {decimals} to ever change, and may work incorrectly if it does.\\n     */\\n    function _setupDecimals(uint8 decimals_) internal virtual {\\n        _decimals = decimals_;\\n    }\\n\\n    /**\\n     * @dev Hook that is called before any transfer of tokens. This includes\\n     * minting and burning.\\n     *\\n     * Calling conditions:\\n     *\\n     * - when `from` and `to` are both non-zero, `amount` of ``from``\'s tokens\\n     * will be to transferred to `to`.\\n     * - when `from` is zero, `amount` tokens will be minted for `to`.\\n     * - when `to` is zero, `amount` of ``from``\'s tokens will be burned.\\n     * - `from` and `to` are never both zero.\\n     *\\n     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].\\n     */\\n    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual { }\\n}\\n","keccak256":"0xca0c2396dbeb3503b51abf4248ebf77a1461edad513c01529df51850a012bee3","license":"MIT"},"@openzeppelin/contracts/token/ERC20/IERC20.sol":{"content":"// SPDX-License-Identifier: MIT\\n\\npragma solidity >=0.6.0 <0.8.0;\\n\\n/**\\n * @dev Interface of the ERC20 standard as defined in the EIP.\\n */\\ninterface IERC20 {\\n    /**\\n     * @dev Returns the amount of tokens in existence.\\n     */\\n    function totalSupply() external view returns (uint256);\\n\\n    /**\\n     * @dev Returns the amount of tokens owned by `account`.\\n     */\\n    function balanceOf(address account) external view returns (uint256);\\n\\n    /**\\n     * @dev Moves `amount` tokens from the caller\'s account to `recipient`.\\n     *\\n     * Returns a boolean value indicating whether the operation succeeded.\\n     *\\n     * Emits a {Transfer} event.\\n     */\\n    function transfer(address recipient, uint256 amount) external returns (bool);\\n\\n    /**\\n     * @dev Returns the remaining number of tokens that `spender` will be\\n     * allowed to spend on behalf of `owner` through {transferFrom}. This is\\n     * zero by default.\\n     *\\n     * This value changes when {approve} or {transferFrom} are called.\\n     */\\n    function allowance(address owner, address spender) external view returns (uint256);\\n\\n    /**\\n     * @dev Sets `amount` as the allowance of `spender` over the caller\'s tokens.\\n     *\\n     * Returns a boolean value indicating whether the operation succeeded.\\n     *\\n     * IMPORTANT: Beware that changing an allowance with this method brings the risk\\n     * that someone may use both the old and the new allowance by unfortunate\\n     * transaction ordering. One possible solution to mitigate this race\\n     * condition is to first reduce the spender\'s allowance to 0 and set the\\n     * desired value afterwards:\\n     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729\\n     *\\n     * Emits an {Approval} event.\\n     */\\n    function approve(address spender, uint256 amount) external returns (bool);\\n\\n    /**\\n     * @dev Moves `amount` tokens from `sender` to `recipient` using the\\n     * allowance mechanism. `amount` is then deducted from the caller\'s\\n     * allowance.\\n     *\\n     * Returns a boolean value indicating whether the operation succeeded.\\n     *\\n     * Emits a {Transfer} event.\\n     */\\n    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);\\n\\n    /**\\n     * @dev Emitted when `value` tokens are moved from one account (`from`) to\\n     * another (`to`).\\n     *\\n     * Note that `value` may be zero.\\n     */\\n    event Transfer(address indexed from, address indexed to, uint256 value);\\n\\n    /**\\n     * @dev Emitted when the allowance of a `spender` for an `owner` is set by\\n     * a call to {approve}. `value` is the new allowance.\\n     */\\n    event Approval(address indexed owner, address indexed spender, uint256 value);\\n}\\n","keccak256":"0x5f02220344881ce43204ae4a6281145a67bc52c2bb1290a791857df3d19d78f5","license":"MIT"},"@openzeppelin/contracts/utils/Context.sol":{"content":"// SPDX-License-Identifier: MIT\\n\\npragma solidity >=0.6.0 <0.8.0;\\n\\n/*\\n * @dev Provides information about the current execution context, including the\\n * sender of the transaction and its data. While these are generally available\\n * via msg.sender and msg.data, they should not be accessed in such a direct\\n * manner, since when dealing with GSN meta-transactions the account sending and\\n * paying for execution may not be the actual sender (as far as an application\\n * is concerned).\\n *\\n * This contract is only required for intermediate, library-like contracts.\\n */\\nabstract contract Context {\\n    function _msgSender() internal view virtual returns (address payable) {\\n        return msg.sender;\\n    }\\n\\n    function _msgData() internal view virtual returns (bytes memory) {\\n        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691\\n        return msg.data;\\n    }\\n}\\n","keccak256":"0x8d3cb350f04ff49cfb10aef08d87f19dcbaecc8027b0bed12f3275cd12f38cf0","license":"MIT"},"contracts/Token.sol":{"content":"pragma solidity 0.7.6;\\r\\n\\r\\nimport \\"@openzeppelin/contracts/token/ERC20/ERC20.sol\\";\\r\\n\\r\\ncontract Token is ERC20 {\\r\\n    constructor() ERC20(\\"Mintable Token\\", \\"TKN\\") {}\\r\\n\\r\\n    function mint(address to, uint wad) public {\\r\\n        _mint(to, wad);\\r\\n    }\\r\\n\\r\\n    function burn(uint wad) public {\\r\\n        _burn(msg.sender, wad);\\r\\n    }\\r\\n}","keccak256":"0x7df24a126d197ef1739544e14eaf89923ef11b571e9ea83e499a8f67b77c555f"}},"version":1}',
  bytecode:
    '0x608060405234801561001057600080fd5b506040518060400160405280600e81526020016d26b4b73a30b13632902a37b5b2b760911b815250604051806040016040528060038152602001622a25a760e91b815250816003908051906020019061006a929190610093565b50805161007e906004906020840190610093565b50506005805460ff1916601217905550610134565b828054600181600116156101000203166002900490600052602060002090601f0160209004810192826100c9576000855561010f565b82601f106100e257805160ff191683800117855561010f565b8280016001018555821561010f579182015b8281111561010f5782518255916020019190600101906100f4565b5061011b92915061011f565b5090565b5b8082111561011b5760008155600101610120565b610d1a806101436000396000f3fe608060405234801561001057600080fd5b50600436106100df5760003560e01c806340c10f191161008c57806395d89b411161006657806395d89b41146102ac578063a457c2d7146102b4578063a9059cbb146102e0578063dd62ed3e1461030c576100df565b806340c10f191461023b57806342966c681461026957806370a0823114610286576100df565b806323b872dd116100bd57806323b872dd146101bb578063313ce567146101f1578063395093511461020f576100df565b806306fdde03146100e4578063095ea7b31461016157806318160ddd146101a1575b600080fd5b6100ec61033a565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561012657818101518382015260200161010e565b50505050905090810190601f1680156101535780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61018d6004803603604081101561017757600080fd5b506001600160a01b0381351690602001356103d0565b604080519115158252519081900360200190f35b6101a96103ed565b60408051918252519081900360200190f35b61018d600480360360608110156101d157600080fd5b506001600160a01b038135811691602081013590911690604001356103f3565b6101f961047a565b6040805160ff9092168252519081900360200190f35b61018d6004803603604081101561022557600080fd5b506001600160a01b038135169060200135610483565b6102676004803603604081101561025157600080fd5b506001600160a01b0381351690602001356104d1565b005b6102676004803603602081101561027f57600080fd5b50356104df565b6101a96004803603602081101561029c57600080fd5b50356001600160a01b03166104ec565b6100ec610507565b61018d600480360360408110156102ca57600080fd5b506001600160a01b038135169060200135610568565b61018d600480360360408110156102f657600080fd5b506001600160a01b0381351690602001356105d0565b6101a96004803603604081101561032257600080fd5b506001600160a01b03813581169160200135166105e4565b60038054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156103c65780601f1061039b576101008083540402835291602001916103c6565b820191906000526020600020905b8154815290600101906020018083116103a957829003601f168201915b5050505050905090565b60006103e46103dd61060f565b8484610613565b50600192915050565b60025490565b60006104008484846106ff565b6104708461040c61060f565b61046b85604051806060016040528060288152602001610c2e602891396001600160a01b038a1660009081526001602052604081209061044a61060f565b6001600160a01b03168152602081019190915260400160002054919061085a565b610613565b5060019392505050565b60055460ff1690565b60006103e461049061060f565b8461046b85600160006104a161060f565b6001600160a01b03908116825260208083019390935260409182016000908120918c1681529252902054906108f1565b6104db8282610952565b5050565b6104e93382610a42565b50565b6001600160a01b031660009081526020819052604090205490565b60048054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156103c65780601f1061039b576101008083540402835291602001916103c6565b60006103e461057561060f565b8461046b85604051806060016040528060258152602001610cc0602591396001600061059f61060f565b6001600160a01b03908116825260208083019390935260409182016000908120918d1681529252902054919061085a565b60006103e46105dd61060f565b84846106ff565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b3390565b6001600160a01b0383166106585760405162461bcd60e51b8152600401808060200182810382526024815260200180610c9c6024913960400191505060405180910390fd5b6001600160a01b03821661069d5760405162461bcd60e51b8152600401808060200182810382526022815260200180610be66022913960400191505060405180910390fd5b6001600160a01b03808416600081815260016020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b6001600160a01b0383166107445760405162461bcd60e51b8152600401808060200182810382526025815260200180610c776025913960400191505060405180910390fd5b6001600160a01b0382166107895760405162461bcd60e51b8152600401808060200182810382526023815260200180610ba16023913960400191505060405180910390fd5b610794838383610b3e565b6107d181604051806060016040528060268152602001610c08602691396001600160a01b038616600090815260208190526040902054919061085a565b6001600160a01b03808516600090815260208190526040808220939093559084168152205461080090826108f1565b6001600160a01b038084166000818152602081815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b600081848411156108e95760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b838110156108ae578181015183820152602001610896565b50505050905090810190601f1680156108db5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b505050900390565b60008282018381101561094b576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b9392505050565b6001600160a01b0382166109ad576040805162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015290519081900360640190fd5b6109b960008383610b3e565b6002546109c690826108f1565b6002556001600160a01b0382166000908152602081905260409020546109ec90826108f1565b6001600160a01b0383166000818152602081815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b6001600160a01b038216610a875760405162461bcd60e51b8152600401808060200182810382526021815260200180610c566021913960400191505060405180910390fd5b610a9382600083610b3e565b610ad081604051806060016040528060228152602001610bc4602291396001600160a01b038516600090815260208190526040902054919061085a565b6001600160a01b038316600090815260208190526040902055600254610af69082610b43565b6002556040805182815290516000916001600160a01b038516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9181900360200190a35050565b505050565b600082821115610b9a576040805162461bcd60e51b815260206004820152601e60248201527f536166654d6174683a207375627472616374696f6e206f766572666c6f770000604482015290519081900360640190fd5b5090039056fe45524332303a207472616e7366657220746f20746865207a65726f206164647265737345524332303a206275726e20616d6f756e7420657863656564732062616c616e636545524332303a20617070726f766520746f20746865207a65726f206164647265737345524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e636545524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636545524332303a206275726e2066726f6d20746865207a65726f206164647265737345524332303a207472616e736665722066726f6d20746865207a65726f206164647265737345524332303a20617070726f76652066726f6d20746865207a65726f206164647265737345524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726fa264697066735822122081716e5be28045dc86df78cc8398f56a690e0f02cc4d628f3b4fc1517e71f32d64736f6c63430007060033',
  deployedBytecode:
    '0x608060405234801561001057600080fd5b50600436106100df5760003560e01c806340c10f191161008c57806395d89b411161006657806395d89b41146102ac578063a457c2d7146102b4578063a9059cbb146102e0578063dd62ed3e1461030c576100df565b806340c10f191461023b57806342966c681461026957806370a0823114610286576100df565b806323b872dd116100bd57806323b872dd146101bb578063313ce567146101f1578063395093511461020f576100df565b806306fdde03146100e4578063095ea7b31461016157806318160ddd146101a1575b600080fd5b6100ec61033a565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561012657818101518382015260200161010e565b50505050905090810190601f1680156101535780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61018d6004803603604081101561017757600080fd5b506001600160a01b0381351690602001356103d0565b604080519115158252519081900360200190f35b6101a96103ed565b60408051918252519081900360200190f35b61018d600480360360608110156101d157600080fd5b506001600160a01b038135811691602081013590911690604001356103f3565b6101f961047a565b6040805160ff9092168252519081900360200190f35b61018d6004803603604081101561022557600080fd5b506001600160a01b038135169060200135610483565b6102676004803603604081101561025157600080fd5b506001600160a01b0381351690602001356104d1565b005b6102676004803603602081101561027f57600080fd5b50356104df565b6101a96004803603602081101561029c57600080fd5b50356001600160a01b03166104ec565b6100ec610507565b61018d600480360360408110156102ca57600080fd5b506001600160a01b038135169060200135610568565b61018d600480360360408110156102f657600080fd5b506001600160a01b0381351690602001356105d0565b6101a96004803603604081101561032257600080fd5b506001600160a01b03813581169160200135166105e4565b60038054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156103c65780601f1061039b576101008083540402835291602001916103c6565b820191906000526020600020905b8154815290600101906020018083116103a957829003601f168201915b5050505050905090565b60006103e46103dd61060f565b8484610613565b50600192915050565b60025490565b60006104008484846106ff565b6104708461040c61060f565b61046b85604051806060016040528060288152602001610c2e602891396001600160a01b038a1660009081526001602052604081209061044a61060f565b6001600160a01b03168152602081019190915260400160002054919061085a565b610613565b5060019392505050565b60055460ff1690565b60006103e461049061060f565b8461046b85600160006104a161060f565b6001600160a01b03908116825260208083019390935260409182016000908120918c1681529252902054906108f1565b6104db8282610952565b5050565b6104e93382610a42565b50565b6001600160a01b031660009081526020819052604090205490565b60048054604080516020601f60026000196101006001881615020190951694909404938401819004810282018101909252828152606093909290918301828280156103c65780601f1061039b576101008083540402835291602001916103c6565b60006103e461057561060f565b8461046b85604051806060016040528060258152602001610cc0602591396001600061059f61060f565b6001600160a01b03908116825260208083019390935260409182016000908120918d1681529252902054919061085a565b60006103e46105dd61060f565b84846106ff565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b3390565b6001600160a01b0383166106585760405162461bcd60e51b8152600401808060200182810382526024815260200180610c9c6024913960400191505060405180910390fd5b6001600160a01b03821661069d5760405162461bcd60e51b8152600401808060200182810382526022815260200180610be66022913960400191505060405180910390fd5b6001600160a01b03808416600081815260016020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b6001600160a01b0383166107445760405162461bcd60e51b8152600401808060200182810382526025815260200180610c776025913960400191505060405180910390fd5b6001600160a01b0382166107895760405162461bcd60e51b8152600401808060200182810382526023815260200180610ba16023913960400191505060405180910390fd5b610794838383610b3e565b6107d181604051806060016040528060268152602001610c08602691396001600160a01b038616600090815260208190526040902054919061085a565b6001600160a01b03808516600090815260208190526040808220939093559084168152205461080090826108f1565b6001600160a01b038084166000818152602081815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b600081848411156108e95760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b838110156108ae578181015183820152602001610896565b50505050905090810190601f1680156108db5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b505050900390565b60008282018381101561094b576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b9392505050565b6001600160a01b0382166109ad576040805162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015290519081900360640190fd5b6109b960008383610b3e565b6002546109c690826108f1565b6002556001600160a01b0382166000908152602081905260409020546109ec90826108f1565b6001600160a01b0383166000818152602081815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b6001600160a01b038216610a875760405162461bcd60e51b8152600401808060200182810382526021815260200180610c566021913960400191505060405180910390fd5b610a9382600083610b3e565b610ad081604051806060016040528060228152602001610bc4602291396001600160a01b038516600090815260208190526040902054919061085a565b6001600160a01b038316600090815260208190526040902055600254610af69082610b43565b6002556040805182815290516000916001600160a01b038516917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9181900360200190a35050565b505050565b600082821115610b9a576040805162461bcd60e51b815260206004820152601e60248201527f536166654d6174683a207375627472616374696f6e206f766572666c6f770000604482015290519081900360640190fd5b5090039056fe45524332303a207472616e7366657220746f20746865207a65726f206164647265737345524332303a206275726e20616d6f756e7420657863656564732062616c616e636545524332303a20617070726f766520746f20746865207a65726f206164647265737345524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e636545524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636545524332303a206275726e2066726f6d20746865207a65726f206164647265737345524332303a207472616e736665722066726f6d20746865207a65726f206164647265737345524332303a20617070726f76652066726f6d20746865207a65726f206164647265737345524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726fa264697066735822122081716e5be28045dc86df78cc8398f56a690e0f02cc4d628f3b4fc1517e71f32d64736f6c63430007060033',
  devdoc: {
    kind: 'dev',
    methods: {
      'allowance(address,address)': {
        details: 'See {IERC20-allowance}.',
      },
      'approve(address,uint256)': {
        details:
          'See {IERC20-approve}. Requirements: - `spender` cannot be the zero address.',
      },
      'balanceOf(address)': {
        details: 'See {IERC20-balanceOf}.',
      },
      'decimals()': {
        details:
          'Returns the number of decimals used to get its user representation. For example, if `decimals` equals `2`, a balance of `505` tokens should be displayed to a user as `5,05` (`505 / 10 ** 2`). Tokens usually opt for a value of 18, imitating the relationship between Ether and Wei. This is the value {ERC20} uses, unless {_setupDecimals} is called. NOTE: This information is only used for _display_ purposes: it in no way affects any of the arithmetic of the contract, including {IERC20-balanceOf} and {IERC20-transfer}.',
      },
      'decreaseAllowance(address,uint256)': {
        details:
          'Atomically decreases the allowance granted to `spender` by the caller. This is an alternative to {approve} that can be used as a mitigation for problems described in {IERC20-approve}. Emits an {Approval} event indicating the updated allowance. Requirements: - `spender` cannot be the zero address. - `spender` must have allowance for the caller of at least `subtractedValue`.',
      },
      'increaseAllowance(address,uint256)': {
        details:
          'Atomically increases the allowance granted to `spender` by the caller. This is an alternative to {approve} that can be used as a mitigation for problems described in {IERC20-approve}. Emits an {Approval} event indicating the updated allowance. Requirements: - `spender` cannot be the zero address.',
      },
      'name()': {
        details: 'Returns the name of the token.',
      },
      'symbol()': {
        details:
          'Returns the symbol of the token, usually a shorter version of the name.',
      },
      'totalSupply()': {
        details: 'See {IERC20-totalSupply}.',
      },
      'transfer(address,uint256)': {
        details:
          'See {IERC20-transfer}. Requirements: - `recipient` cannot be the zero address. - the caller must have a balance of at least `amount`.',
      },
      'transferFrom(address,address,uint256)': {
        details:
          "See {IERC20-transferFrom}. Emits an {Approval} event indicating the updated allowance. This is not required by the EIP. See the note at the beginning of {ERC20}. Requirements: - `sender` and `recipient` cannot be the zero address. - `sender` must have a balance of at least `amount`. - the caller must have allowance for ``sender``'s tokens of at least `amount`.",
      },
    },
    version: 1,
  },
  userdoc: {
    kind: 'user',
    methods: {},
    version: 1,
  },
  storageLayout: {
    storage: [
      {
        astId: 371,
        contract: 'contracts/Token.sol:Token',
        label: '_balances',
        offset: 0,
        slot: '0',
        type: 't_mapping(t_address,t_uint256)',
      },
      {
        astId: 377,
        contract: 'contracts/Token.sol:Token',
        label: '_allowances',
        offset: 0,
        slot: '1',
        type: 't_mapping(t_address,t_mapping(t_address,t_uint256))',
      },
      {
        astId: 379,
        contract: 'contracts/Token.sol:Token',
        label: '_totalSupply',
        offset: 0,
        slot: '2',
        type: 't_uint256',
      },
      {
        astId: 381,
        contract: 'contracts/Token.sol:Token',
        label: '_name',
        offset: 0,
        slot: '3',
        type: 't_string_storage',
      },
      {
        astId: 383,
        contract: 'contracts/Token.sol:Token',
        label: '_symbol',
        offset: 0,
        slot: '4',
        type: 't_string_storage',
      },
      {
        astId: 385,
        contract: 'contracts/Token.sol:Token',
        label: '_decimals',
        offset: 0,
        slot: '5',
        type: 't_uint8',
      },
    ],
    types: {
      t_address: {
        encoding: 'inplace',
        label: 'address',
        numberOfBytes: '20',
      },
      't_mapping(t_address,t_mapping(t_address,t_uint256))': {
        encoding: 'mapping',
        key: 't_address',
        label: 'mapping(address => mapping(address => uint256))',
        numberOfBytes: '32',
        value: 't_mapping(t_address,t_uint256)',
      },
      't_mapping(t_address,t_uint256)': {
        encoding: 'mapping',
        key: 't_address',
        label: 'mapping(address => uint256)',
        numberOfBytes: '32',
        value: 't_uint256',
      },
      t_string_storage: {
        encoding: 'bytes',
        label: 'string',
        numberOfBytes: '32',
      },
      t_uint256: {
        encoding: 'inplace',
        label: 'uint256',
        numberOfBytes: '32',
      },
      t_uint8: {
        encoding: 'inplace',
        label: 'uint8',
        numberOfBytes: '1',
      },
    },
  },
}
/* const mintTestTokens = async (address: string, signer: ethers.Signer) => {
  const tokenArray = [
    '0x70202b6ef79deee9c0bfd3e93f7704f289b0f684',
    '0xcbc6cd7df1deb8d9b77783ede5659e8228f7bf64',
    '0x552cee895bb1cb928699793df6249486ec50e94c',
    '0xe332f2f021f9b8b2367598c48ae319136cef6d62',
    '0x0328807d22ec485d1a01ffdcfd19fd375c2f1112',
    '0x056e1ef9df4f1d0a5cc82bb3fa5c934b4df889b7',
    '0x82e2dbd5fddde3a44f7278b279025c5b2b9d657b',
    '0xf35e127ac7087a8361edd5d8c3f178150710ed4b',
  ]

  const amount = ethers.utils.parseEther('1000000000')
  for (let token of tokenArray) {
    const contract = new ethers.Contract(token, ERC20.abi, signer)
    await contract.mint(address, amount)
   }
}*/
const mintTestTokens = async (
  address: string,
  token: string,
  signer: ethers.Signer
): Promise<any> => {
  const amount = ethers.utils.parseEther('1000')

  const contract = new ethers.Contract(token, ERC20.abi, signer)
  contract
    .mint(address, amount)
    .then((tx: ethers.Transaction) => {
      return tx
    })
    .catch((err) => {
      console.log(`Issue when minting test tokens ${err}`)
      return null
    })
}
export default mintTestTokens

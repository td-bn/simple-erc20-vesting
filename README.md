# Token with vesting schedule
Simple ERC20 token with a vesting schedule. Assumes beneficiaries will be known before hand (shouldn't be a problem to change as per requirement)

### Misc
Uses block timestamps to work with time.
Can also use block numbers and average block times to achieve the same effect.

RBAC seemed like an overkill for beneficiary roles since it does the same this in the background (uses mappings to store addresses)

### Testing
Install dependencies `npm  i` and then run the tests with:
```shell
npx hardhat test
```

### Todo
* Add simple UI to interact with token
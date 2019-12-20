# HIVEHack hackathon management contract pack

## Contracts
### HIVEHack.js
manage hackathon member
#### Features
- issue NFT
- manege hackathon status
- check user account's auth
- notify observers (in this time, payment and voting contracts)

### HIVEHackPayment.js
serve payment feature
#### Features
- minting (per 30 seconds => available increce)
- manage goods menu

### HIVEHackVoting.js
serve voting feature
#### Features
- submit the order
- aggregate ranking

## API

### HIVEHack
#### addObserver(contract)
- add features
- _require HIVEHack owner auth_ 
- _require contract auth_

#### hold(symbol, owner, beginning, ending)
- create new hackathon
- beginning and ending time is 19 digit number

#### register(symbol, id, hn, memo)
- add joiner
- it is recommended to use the same id and hn, but there is no need to match them

#### open(symbol)
- start hackathon event
- _require hackathon owner auth_

#### close(symbol)
- finish hackathon event
- _require hackathon owner auth_

#### checkStatus(symbol, expect)
- check hackathon status

#### checkActive(symbol, hn)
- check hackathon joiner auth
// ContractAj52GUZwyNELJHdR9FnHxvHUDL3cq4eMB2P72V9JJkFQ
class HIVEHack {
    init() {
        storage.put('observers', JSON.stringify([]));
        storage.put('notifications', JSON.stringify([]))
    }
    can_update(data) {
        return true
    }
    /**
     * add new feature
     * @param {string} contract 
     */
    addObserver(contract) {
        if (!contract.startsWith('Contract')) {
            throw new Error('observer is contract')
        }
        if (!blockchain.requireAuth(blockchain.contractOwner(), 'active')) {
            throw new Error('contract owner permission denied')
        }
        if (!blockchain.requireAuth(contract, 'active')) {
            throw new Error('contract permission denied')
        }
        let observers = JSON.parse(storage.get('observers'));
        if (observers.indexOf(contract) !== -1) {
            throw new Error('already observed')
        }
        observers.push(contract);
        storage.put('observers', JSON.stringify(observers));
    }
    /**
     * hold new HIVEHack
     * @param {string} owner 
     * @param {string} symbol 
     * @param {number} beginning 
     * @param {number} ending 
     */
    hold(symbol, owner, beginning, ending) {
        this.checkStatus(symbol, null);
        if (!blockchain.requireAuth(blockchain.contractOwner(), 'active')) {
            throw new Error('contract owner permission denied')
        }
        if (!blockchain.requireAuth(owner, 'active')) {
            throw new Error('permission denied')
        }
        if (beginning.toString().length !== 19) {
            throw new Error('invalid beginning digit')
        }
        if (ending.toString().length !== 19) {
            throw new Error('invalid ending digit')
        }
        if (beginning < tx.time) {
            throw new Error('invalid beginning time')
        }
        if (ending < tx.time) {
            throw new Error('invalid ending time')
        }
        if (ending < beginning) {
            throw new Error('invalid ending time')
        }
        blockchain.callWithAuth('token721.iost', 'create', [symbol, blockchain.contractName(), 100]);
        let action = 'hold';
        let args = { symbol, owner, beginning, ending };
        this._notifyObservers(action, args);
        this._chainize(symbol);
        storage.put(symbol.concat('/status'), 'ready');
        storage.put(symbol.concat('/owner'), owner);
        storage.put(symbol.concat('/beginning'), beginning.toString());
        storage.put(symbol.concat('/ending'), ending.toString());
        // blockchain.event(JSON.stringify({ action, args }))
    }
    /**
     * 
     * @param {string} symbol 
     * @param {string} id 
     * @param {string} hn 
     * @param {string} memo 
     */
    register(symbol, id, hn, memo) {
        this.checkStatus(symbol, 'ready');
        if (hn.length < 5 || hn.length > 11) {
            throw new Error('invalid handle name length')
        }
        for (let i in hn) {
            let ch = id[i];
            if (!(ch >= 'a' && ch <= 'z' || ch >= '0' && ch <= '9' || ch === '_')) {
                throw new Error('invalid hid char')
            }
        }
        if (storage.mapGet(symbol.concat('/tokenID'), hn) !== null) {
            throw new Error('handle name already exist')
        }
        let tokenID = blockchain.callWithAuth('token721.iost', 'issue', [symbol, id, JSON.stringify({
            hn,
            hash: tx.hash,
            time: tx.time,
            memo
        })])[0];
        let action = 'register';
        let args = { symbol, id, hn, memo };
        this._notifyObservers(action, args);
        this._chainize(symbol);
        storage.mapPut(symbol.concat('/tokenID'), hn, tokenID);
        // blockchain.event(JSON.stringify({ action, args }))
    }
    /**
     * start hackathon
     * @param {string} symbol 
     */
    open(symbol) {
        this.checkStatus(symbol, 'ready');
        let owner = storage.get(symbol.concat('/owner'));
        if (!blockchain.requireAuth(owner, 'active')) {
            throw new Error('permission denied')
        }
        let ending = Number(storage.get(symbol.concat('/beginning')));
        if (tx.time < ending) {
            throw new Error('ending time not reached')
        }
        let action = 'open';
        let args = { symbol };
        this._notifyObservers(action, args);
        this._chainize(symbol);
        blockchain.event(JSON.stringify({ action, args }))
    }
    /**
     * finish hackathon
     * @param {string} symbol 
     */
    close(symbol) {
        this.checkStatus(symbol, 'running');
        let owner = storage.get(symbol.concat('/owner'));
        if (!blockchain.requireAuth(owner, 'active')) {
            throw new Error('permission denied')
        }
        let ending = Number(storage.get(symbol.concat('/beginning')));
        if (tx.time < ending) {
            throw new Error('ending time not reached')
        }
        let action = 'close';
        let args = { symbol };
        this._notifyObservers(action, args);
        this._chainize(symbol);
        storage.del(symbol.concat('/status'));
        storage.del(symbol.concat('/owner'));
        storage.del(symbol.concat('/latest'));
        storage.del(symbol.concat('/beginning'));
        storage.del(symbol.concat('/ending'));
        let members = storage.mapKeys(symbol.concat('/tokenID'));
        members.forEach(hn => {
            storage.mapDel(symbol.concat('/tokenID'), hn)
        });
        // blockchain.event(JSON.stringify({ action, args }))
    }
    /**
     * 
     * @param {string} symbol 
     * @param {string} expect 
     */
    checkStatus(symbol, expect) {
        let status = storage.get(symbol.concat('/status'));
        if (status !== expect) {
            throw new Error('status error')
        }
    }
    /**
     * 
     * @param {string} symbol 
     * @param {string} hn 
     */
    checkActive(symbol, hn) {
        let tokenID = storage.mapGet(symbol.concat('/tokenID'), hn);
        let nftOwner = blockchain.call('token721.iost', 'ownerOf' [symbol, tokenID])[0];
        if (!blockchain.requireAuth(nftOwner, 'active')) {
            throw new Error('permission denied')
        }
    }
    /**
     * 
     * @param {string} action 
     * @param {any} args 
     * @param {any} option 
     */
    _notifyObservers(action, args, option) {
        let notifications = JSON.parse(storage.get('notifications'));
        notifications.push({ action , args, option });
        storage.put('notifications', JSON.stringify(notifications));
        let observers = JSON.parse(storage.get('observers'));
        observers.forEach(contract => {
            blockchain.call(contract, 'notify', [])
        });
        let len = notifications.length;
        notifications.splice(len, 1);
        storage.put('notifications', JSON.stringify(notifications));
    }
    /**
     * add latest info to history chain
     * @param {string} symbol 
     */
    _chainize(symbol) {
        let latest = JSON.parse(storage.get(symbol.concat('/latest')));
        if (latest === null) {
            storage.put(symbol.concat('/latest'), JSON.stringify({ n: 0, h: tx.hash }));
            blockchain.receipt(JSON.stringify({ n: -1, h: null }));
        } else {
            storage.put(symbol.concat('/latest'), JSON.stringify({ n: latest.n + 1, h: tx.hash }));
            blockchain.receipt(JSON.stringify(latest));
        }
    }
}
module.exports = HIVEHack;
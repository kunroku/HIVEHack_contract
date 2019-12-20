const HIVEHack = '';
class HIVEHackVoting {
    init() {}
    /**
     * 
     * @param {string} symbol 
     */
    create(symbol) {
        if (!blockchain.requireAuth(blockchain.contractOwner(), 'active')) {
            throw new Error('permission denied')
        }
        let deadline = this._globalStorageGet(JSON.stringify({ 'deadline': symbol }), symbol);
        if (deadline ===  null) {
            throw new Error('invalid voting symbol')
        }
        if (tx.time < Number(deadline)) {
            throw new Error('deadline not reached')
        }
        
        if (storage.mapHas('points', symbol, JSON.stringify(points))) {}
        // let deadline = storage.globalMapGet(TOKEN, JSON.stringify({ 'deadline': symbol }));
        // // check deadline
        // this._localStoragePut(symbol, 'points', );
    }
    /**
     * 
     * @param {string} symbol 
     * @param {string} hid 
     * @param {string} data 
     */
    vote(symbol, hid, data) {
        data = JSON.parse(data);
        if (data && Array.isArray(data) && data.length === storage.globalMapLen(TOKEN, 'tokenID')) {
            let points = JSON.parse(this._localStorageGet(symbol, 'points'))
            for (let i = 0; i < data.length; i++) {
                if (data.indexOf(data[i]) !== i) {
                    throw new Error('duplicate error')
                }
                let point = data.length - i;
            }
        } else {
            throw new Error('invalid voting data')
        }
    }
    aggregate(symbol) {
        if (!blockchain.requireAuth(blockchain.contractOwner(), 'active')) {
            throw new Error('permission denied')
        }

    }
}
module.exports = HIVEHackVoting;
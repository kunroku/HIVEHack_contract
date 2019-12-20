// ContractCmb1d6dyf4nmcYNSnmDuSnHoTfDgcj1CqEmFJNGyzHrB
const HIVEHack = 'ContractAj52GUZwyNELJHdR9FnHxvHUDL3cq4eMB2P72V9JJkFQ';
class HIVEHackPayment {
    init() {
        blockchain.callWithAuth(HIVEHack, 'addObserver', [blockchain.contractName()])
    }
    can_update(data) {
        return true
    }
    /**
     * 
     */
    notify() {
        let notifications = JSON.parse(storage.globalGet(HIVEHack, 'notifications'));
        if (notifications.length === 0) {
            throw new Error('empty notifications')
        }
        let notification = notifications[notifications.length - 1];
        let funcName = '_' + notification.action + 'Observer';
        if (typeof this[funcName] === 'function') {
            this[funcName](notification.args, notification.option)
        }
    }
    /**
     * 
     * @param {string} symbol 
     * @param {string} name 
     * @param {number} amount 
     * @param {number} cost 
     */
    addGoods(symbol, name, amount, cost) {
        if (!blockchain.requireAuth(blockchain.contractOwner(), 'active')) {
            throw new Error('contract owner permission denied')
        }
        if (!amount.isInteger()) {
            throw new Error('integer value is required')
        }
        if (!cost.isInteger()) {
            throw new Error('integer value is required')
        }
        let info = storage.mapGet(symbol.concat('//menu'), name);
        if (info !== null) {
            storage.mapPut(symbol.concat('/menu'), name, JSON.stringify({ amount: info.amount + amount, cost }))
        } else {
            storage.mapPut(symbol.concat('/menu'), name, JSON.stringify({ amount, cost }))
        }
    }
    /**
     * 
     * @param {string} symbol 
     * @param {string} hn 
     * @param {string} goodsName 
     */
    buy(symbol, hn, goodsName) {
        let info = JSON.parse(storage.mapGet(symbol.concat('/menu'), goodsName));
        if (info === null) {
            throw new Error('invalid goods')
        }
        if (info.amount === 0) {
            throw new Error('sold out')
        }
        let latest = JSON.parse(storage.mapGet(symbol.concat('/latest'), hn));
        if (latest === null) {
            throw new Error('handle name not found')
        }
        let balance = this.getAvailable(hn);
        let newBalance = balance - info.cost;
        if (balance < 0) {
            throw new Error('insufficient funds')
        }
        this._chainize(symbol, hn);
        info.amount--;
        storage.mapPut(symbol.concat('/menu'), goodsName, JSON.stringify(info));
        storage.mapPut(args.symbol.concat('/balance'), hn, newBalance.toString());
        blockchain.event(JSON.stringify({ action: 'buy', hn, goodsName }))
    }
    /**
     * available amount increment per 30 seconds
     * @param {string} symbol 
     * @param {string} hn 
     */
    getAvailable(symbol, hn) {
        let latest = JSON.parse(storage.mapGet(symbol.concat('/latest'), hn));
        let diff = new BigNumber(tx.time).minus(latest.t);
        let grace = diff.div(3e10).toFixed(0);
        let available = new BigNumber(storage.mapGet(symbol.concat('/balance'), hn)).plus(grace);
        return Number(available.toString())
    }
    /**
     * 
     * @param {any} args 
     */
    _openObserver(args) {
        let members = storage.globalMapKeys(HIVEHack, args.symbol.concat('/tokenID'));
        members.forEach(hn => {
            storage.mapPut(args.symbol.concat('/balance'), hn, '0');
            this._chainize(args.symbol, hn)
        })
    }
    /**
     * 
     * @param {any} args 
     */
    _closeObserver(args) {
        let members = storage.mapKeys(args.symbol.concat('/latest'));
        let archive = [];
        members.forEach(hn => {
            archive.push({ [hn]: JSON.pares(storage.mapGet(args.symbol.concat('/latest'), hn)) });
            storage.mapDel(args.symbol.concat('/latest'), hn)
        })
        blockchain.receipt(JSON.stringify(archive))
    }
    /**
     * add latest info to history chain
     * @param {string} symbol 
     * @param {string} hn 
     */
    _chainize(symbol, hn) {
        let latest = JSON.parse(storage.mapGet(symbol.concat('/latest'), hn));
        if (latest === null) {
            storage.mapPut(symbol.concat('/latest'), hn, JSON.stringify({ n: 0, t: tx.time, h: tx.hash }));
            blockchain.receipt(JSON.stringify({ n: -1, t: null, h: null }));
        } else {
            storage.mapPut(symbol.concat('/latest'), hn, JSON.stringify({ n: latest.n + 1, h: tx.hash }));
            blockchain.receipt(JSON.stringify(latest));
        }
    }

}
module.exports = HIVEHackPayment;
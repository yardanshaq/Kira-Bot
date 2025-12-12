// i dont know this code bro i just ask ai to make one for me

export class KeyedMutex {
    locks = new Map()
    run(key, fn, ...params){
        const existing = this.locks.get(key) || Promise.resolve()

        const next = existing
        .finally(() => fn(...params))
        .finally(() => {
            // hapus lock jika tidak ada lagi yang menunggu
            if(this.locks.get(key) === next){
                this.locks.delete(key)
            }
        })

        this.locks.set(key, next)
        return next
    }
}
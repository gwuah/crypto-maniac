(function (global, local) {
    
    "use strict";
    
    function Axel(name) {
        return new Axel.init(name);
    }
    
    Axel.init = function (name) {
        this.name = name;
        // check if pointer to database already exists
        // if it does, dont create a new database else create a new database
        this.db = JSON.parse(localStorage.getItem(name)) || []
    };
    
    Axel.prototype = {

        contains(key, value) {
            return this.db.some(chunk => chunk[key] == value)
        },

        updateDb() {
            localStorage.setItem(this.name, JSON.stringify(this.db))
        },

        save: function(data, key) {
            // key is a parameter whose value changes in any given data
            // it could be an "id", "hash", or any unique property of a dataset

            if (this.contains(key, data[key])) {
                console.log("data already exists in db");
                return false

            } else {
                this.db.push(data);
                this.updateDb();
                console.log("data saved!")
                return true
            }
        },
        
        fetchAllSaved: function() {
            return this.db
        }
    };
    
    
    
    Axel.init.prototype = Axel.prototype;
    global.a$ = global.Axel = Axel;
    
}(window, document));
var no = no || {};

//  ---------------------------------------------------------------------------------------------------------------  //

(function() {

//  ---------------------------------------------------------------------------------------------------------------  //

var idb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

//  ---------------------------------------------------------------------------------------------------------------  //

no.DB = function(id, version) {
    this.id = id;
    this.version = version || 1;
};

//  ---------------------------------------------------------------------------------------------------------------  //

no.DB.prototype.init = function(models_ids) {
    this.models_ids = models_ids;

    var promise = new no.Promise();

    var that = this;

    var req = idb.open(this.id, this.version);

    req.onupgradeneeded = function() {
        var db = this.result;

        var items = Object.keys(models_ids);
        for (var i = 0, l = items.length; i < l; i++) {
            try {
                db.createObjectStore( items[i] );
            } catch (e) {};
        }
    };
    req.onsuccess = function() {
        var db = that.db = this.result;

        promise.resolve(db);
    };

    return promise;
};

//  ---------------------------------------------------------------------------------------------------------------  //

no.DB.prototype.set = function(model_id, key, data) {
    var promise = new no.Promise();

    if ( !this.models_ids[model_id] ) {
        return promise.reject();
    }

    var object_store = this.db.transaction(model_id, 'readwrite').objectStore(model_id);

    var req = object_store.put(data, key);

    req.onsuccess = function() {
        promise.resolve();
    };

    return promise;
};

//  ---------------------------------------------------------------------------------------------------------------  //

no.DB.prototype.get = function(model_id, key) {
    var promise = new no.Promise();

    var object_store = this.db.transaction(model_id).objectStore(model_id);

    object_store
        .get(key)
            .onsuccess(function() {
                promise.resolve(this.resolve);
            });

    return promise;
};

//  ---------------------------------------------------------------------------------------------------------------  //

no.DB.prototype.getAll = function(model_id) {
    var promise = new no.Promise();

    var result = {};

    var object_store = this.db.transaction(model_id).objectStore(model_id);

    object_store.openCursor().onsuccess = function() {
        var cursor = this.result;
        if (cursor) {
            result[ cursor.key ] = cursor.value;
            cursor.continue();
        } else {
            promise.resolve(result);
        }
    };

    return promise;
};

//  ---------------------------------------------------------------------------------------------------------------  //

})();


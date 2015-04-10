function range(min, max) {
    var range = [];
    for (;min <=max; min++) {
        range.push(min);
    }
}

Number.prototype.inRange = function (start, end) {
    var range = range(start, end);


};

    'use strict';

    var ajax = function() {
        this.supported = true;

        this.method;
        this.url;

        this.instance = null;
        // Default callbacks
        this.callbacks = {
            'error': function (data) {
                var output = '';
                for (var k in data) {
                    output += k + ': ' + data[v] + '\n\r';
                }

                console.error(output);
            },
            'success': function() {},
            'notfound': function(method, url, callback) {
                console.log('Method: ' + method + '| URL: "' + url + '" was not found.');
                if(callback) {
                    callback();
                }
            }
        };

        if (!window.XMLHttpRequest) {
            try {
                window.XMLHttpRequest = new ActiveXObject('Msxml2.XMLHTTP');
            } catch (ex) {
                try {
                    // In case any dinosaur still lurks the web
                    window.XMLHttpRequest = new ActiveXObject('Microsoft.XMLHTTP');
                } catch (ex) {
                    this.supported = false;
                    this.trigger('unsupported', {name: ex.name, message: ex.message});
                }
            }
        }
    };
    // @ToDo: Implement internal event handling
    ajax.prototype.trigger = function(name, data) {
        name = name.toLowerCase();
        if (name.slice(0,2) === 'on') {
            name = name.slice(2);
        }


        if (name in this.callbacks) {
            this.callbacks[name](data);
        } else {
            console.error('Handler for "' + name + '" has not been defined');
        }
    };
    ajax.prototype.open = function(method, url, async, user, password, headers) {
        'use strict';

        this.method = method;
        this.url = url;

        this.instance = new window.XMLHttpRequest;
        this.instance.open(method, url, false, user, password);
        if (typeof headers === 'Object' && headers.length !== 0) {
            this.headers = headers;
        }

        return this;
    };

    ajax.prototype.setRequestHeader = function(name, value) {
        this.addHeader(name, value);
    };

    ajax.prototype.addHeader = function(name, value) {

        console.log('Supported: ' + this.supported);
        if (!this.supported) {
            this.trigger('unsupported', {
                name: 'method call',
                message: 'cant add header/s if the object is not supported'
            });
            return false;
        }

        this.instance.setRequestHeader(name, value);
    };

    ajax.prototype.addHeaders = function(headersList) {
        for (var header in headersList) {
            if (this.addHeader(header, headersList[header]) === false) {
                break;
            }
        }
    };

    ajax.prototype.success = function(callback) {
        this.callbacks['success'] = callback;

        return this;
    };

    ajax.prototype.notFound = function(callback) {
        this.callbacks['notfound'] = callback;

        return this;
    };

    ajax.prototype.error = function(callback) {
        this.callbacks['error'] = callback;

        return this;
    };

    ajax.prototype.send = function(data, timeout, mime) {
        var http = this.instance;
        var self = this;
        this.instance.onreadystatechange = function() {
                // Trigger early (the 404 can terminate the request)
                if (http.status === 404) {
                    self.trigger('notFound', {
                            method: http.method,
                            url: http.url
                        });
                    http.onreadystatechange = null;
                    return false;
                }
            console.log(http.status);
            if (http.readyState === 4) {
                if (http.status >= 400) {
                    self.trigger('error', {
                        method: http.method,
                        url: http.url,
                        response: {
                            type: http.responseType,
                            headers: http.getAllResponseHeaders(),
                            body: http.responseText
                        }
                    });
                    self.stop();
                    return false;
                }
                if (200 <= http.status <= 299) {
                    self.trigger('success', {
                        type: http.responseType,
                        content: http.responseText,
                        headers: http.getAllResponseHeaders()
                    });
                }
            }
        };


        if (timeout !== null && timeout > 0) {
            this.instance.timeout = timeout;
        }

        if (!this.supported) {
            this.trigger('unsupported',{
                name: 'method call',
                message: 'cant add header/s if the object is not supported'
            });
        }

        if (mime !== null) {
            this.instance.overrideMimeType(mime);
        }

        this.instance.send(data);
    };

    ajax.prototype.stop = function() {
        this.instance.abort();
    };
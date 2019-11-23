/**
 * @public
 * @function
 * @desc Manage your cookies simply
 * @author Sukaato (sukaato.github.io)
 * @version 0.0.5
 */
const _CookiesManager = () => {
    const REGEX = new RegExp(/([\w-]+)=([\w- ]+)/);

    /**
     * @public
     * @async
     * @function
     * @param {String} key Name of the cookie you want to get
     * @returns {{key: String, value: String}} Returns an object with the name of the cookie and its value
     */
    const get = async (key) => {
        return new Promise((resolve, reject) => {
            if (!key) return reject({success: false, message: `[Cookies Manager] : You must define a key to get a cookie.`});
            if (!_exist(key)) return reject({success: false, message: `[Cookies Manager] : The cookie doesn't exist.`});
            const COOKIES = _getDocumentCookies();
            const Matcher = COOKIES.find(cookie => {
                const Matcher = cookie.match(REGEX);
                return Matcher[1] === key;
            }).match(REGEX);
            return resolve({key: Matcher[1], value: Matcher[2]});
        });
    };

    /**
     * @public
     * @async
     * @function
     * @param {{key: String, value: String, expire?: Number, domain?: String, path?: String, secure?: Boolean, httpOnly?: Boolean, sameSite?: "Strict"|"Lax"}} cookie Object to define your cookie
     * @desc Please read the readme.md
     */
    const set = async (cookie) => {
        return new Promise((resolve, reject) => {
            if (!cookie.key) return reject('[Cookies Manager] : You must define a name for your cookie.');
            if (!cookie.value) return reject('[Cookies Manager] : You must set a value for your cookie.');
            if (!REGEX.test(`${cookie.key}=${cookie.value}`)) return reject('[Cookies Manager] : The name of the cookie and its value must contain only characters, numbers, dashes (-) or underscore(_). The value can also contain spaces.');
            if (cookie.secure && location.protocol === "http:") return reject(`[Cookies Manager] : You cannot set your cookie as secure because you are not in HTTPS`);
            if (cookie.key.startsWith('__Secure-') && location.protocol === "http:") return reject(`[Cookies Manager] : To use the __Secure- prefix you must be in HTTPS.`);
            if (cookie.key.startsWith('__Secure-') && !cookie.secure) return reject(`[Cookies Manager] : To use the __Secure- prefix you define secure to true in the object`);
            if (cookie.key.startsWith('__Host-') && !cookie.secure) return reject(`[Cookies Manager] : To use the __Host- prefix you define secure to true in the object`);
            if (cookie.key.startsWith('__Host-') && cookie.domain) return reject(`[Cookies Manager] : To use the __Host- prefix you must not define a domain.`);
            if (cookie.key.startsWith('__Host-') && cookie.path !== "/") return reject(`[Cookies Manager] : To use the __Host- prefix you must have a path equal to "/".`);
            if (cookie.sameSite === "None" && !cookie.secure) return reject(`[Cookies Manager] : To define SameSite=None you must define secure to true in the object.`);
            if (cookie.expire && cookie.expire <= 0) return reject(`[Cookies Manager] : You cannot set a negative expiration date.`);
            const COOKIE = _reBuild(cookie);
            document.cookie = `${COOKIE.key}=${COOKIE.value}; Max-Age=${COOKIE.expire} ${COOKIE.domain} Path=${COOKIE.path}; ${COOKIE.secure} ${COOKIE.httpOnly} ${COOKIE.sameSite}`;
            return resolve({success: true, message: "Your cookie has been created with the following settings:", Cookie: COOKIE});
        });
    };

    /**
     * @public
     * @async
     * @function
     * @desc Returns a list with the names of all cookies
     */
    const getList = async () => {
        const COOKIES = _getDocumentCookies();
        if (COOKIES[0] === "") return [];
        return COOKIES.map(cookie => {
            const Matcher = cookie.match(REGEX);
            return Matcher[1];
        });
    }

    /**
     * @public
     * @async
     * @function
     * @param {String} key Name of the cookie you want to delete
     */
    const remove = async (key) => {
        return new Promise((resolve, reject) => {
            return get(key).then(cookie => {
                document.cookie = `${cookie.key}=; Max-Age=-1; Domain=; Path=;`;
                return resolve({success: true, message: `Your cookie ${cookie.key} has been deleted.`});
            }).catch((err) => {
                return reject(err);
            });
        });
    };

    /**
     * @public
     * @async
     * @function
     * @desc Deletes all cookies
     */
    const clear = async () => {
        const COOKIES = await getList();
        if (COOKIES.length === 0) return;
        COOKIES.forEach(cookie => {
            return remove(cookie);
        });
    };

    /**
     * @private
     * @function
     * @desc Returns the list of cookies in raw form
     */
    const _getDocumentCookies = () => {
        return document.cookie.split(';');
    };

    /**
     * @private
     * @function
     * @param {{key: String, value: String, expire?: Number, domain?: String, path?: String, secure?: Boolean, httpOnly?: Boolean, sameSite?: "Strict"|"Lax"}} cookie 
     * @desc Returns a beautiful object to create the cookie
     */
    const _reBuild = (cookie) => {
        return {
            key: cookie.key,
            value: cookie.value,
            expire: cookie.expire ? `${cookie.expire * 86400};` : 'Session;',
            domain: cookie.domain ? `${cookie.domain};` : '',
            path: cookie.path ? `${cookie.path}` : '/',
            secure: cookie.secure ? 'Secure;' : '',
            httpOnly: cookie.httpOnly ? 'HttpOnly;': '',
            sameSite: cookie.sameSite === "Strict" || cookie.sameSite === "Lax" ? `${cookie.sameSite};` : 'Strict;'
        }
    };

    /**
     * @private
     * @async
     * @function
     * @param {String} key Name of the cookie you want to check
     */
    const _exist = async (key) => {
        const COOKIES = _getDocumentCookies();
        if (COOKIES.length === 0) return false;
        return COOKIES.some(cookie => {
            const Matcher = cookie.match(REGEX);
            return Matcher[1] === key;
        });
    };

    return {
        get,
        set,
        getList,
        remove,
        clear,
        version: "0.0.5"
    }
}, CookiesManager = _CookiesManager();
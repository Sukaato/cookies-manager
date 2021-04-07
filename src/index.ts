import { Cookie, DocumentCookie } from './cookie.type';
/**
 * Manage your cookies simply
 * @author Sukaato (sukaato.github.io)
 * @version 1.0.0
 */
export class CookiesManager {

  private readonly prefix = '[Cookies Manager]:';
  private readonly keyRegex = /[^\w-]+/g;
  private readonly valueRegex = /[",;:\\]+/g;
  private readonly cookieMatcher = /([\w-]+)=([^",;:\\]+)/;

  async set(cookie: Cookie): Promise<DocumentCookie> {
    return new Promise((resolve, reject) => {
      this.validate(cookie)
        .then(() => {
          const { prefix, key, value, expire, domain, path, secure, httpOnly, sameSite } = cookie;
          document.cookie = `${prefix ? prefix : ''}${key}=${value}; Max-Age=${expire ?? 'Session'};${domain && ` Domain=${domain};`} Path=${path || '/'};${secure && ' Secure;'}${httpOnly && ' HttpOnly;'}${sameSite ?? 'Lax'}`;
          resolve({ key: `${prefix ? prefix : ''}${key}`, value });
        })
        .catch(reject);
    });
  }

  keys(): string[] {
    const cookies = this.all();

    if (cookies.length === 0) return [];
    return this.all().map(cookie => cookie.key);
  }

  all(): DocumentCookie[] {
    const cookies = document.cookie.split(';');

    if (cookies[0] === '') return [];
    return cookies.map(cookie => {
      const [, key, value ] = cookie.match(this.cookieMatcher);
      return {
        key, value
      }
    });
  }

  async get(key: string): Promise<DocumentCookie> {
    return new Promise((resolve, reject) => {
      if (this.notExist(key)) {
        reject(`${this.prefix} Cookie '${key}' doesn't exist`);
      } else {
        resolve(this.all().find(cookie => cookie.key === key));
      }
    });
  }

  async remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.get(key)
        .then(cookie => {
          document.cookie = `${cookie.key}=; Max-Age=-1; Domain=; Path=;`;
          resolve();
        })
        .catch(reject);
    });
  }

  clear(): void {
    const keys = this.keys();

    if (keys.length === 0) return;
    keys.forEach(async key => this.remove(key));
  }

  exist(key: string): boolean {
    const keys = this.keys();

    if (keys.length === 0) return false;
    return keys.some(k => k === key);
  }

  notExist(key: string): boolean {
    return !this.exist(key);
  }

  private validate(cookie: Cookie): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.keyRegex.test(cookie.key)) {
        return reject(`${this.prefix} '${cookie.key}' contains a non-US-ASCII character.`);
      }
      if (cookie.key.startsWith('__Secure-') || cookie.key.startsWith('__Host-')) {
        return reject(`${this.prefix} Use prefix attribut instead.`);
      }
      if (this.valueRegex.test(cookie.value)) {
        return reject(`${this.prefix} '${cookie.value}' does not contains '" , ; : \\ ' characters.`);
      }
      if (cookie.secure && location.protocol === 'http:') {
        return reject(`${this.prefix} Impossible to set the cookie as secure because the protocol used is not HTTPS.`);
      }
      if (cookie.prefix === '__Secure-') {
        if (location.protocol === 'http:') {
          return reject(`${this.prefix} Impossible to set the cookie as secure because the protocol used is not HTTPS.`);
        }
        if (!cookie.secure) {
          return reject(`${this.prefix} To use the prefix '__Secure-' you must set the attribute 'secure' to true.`);
        }
      }
      if (cookie.prefix === '__Host-') {
        if (!cookie.secure) {
          return reject(`${this.prefix} To use the prefix '__Host-' you must set the attribute 'secure' to true.`);
        }
        if (cookie.domain) {
          return reject(`${this.prefix} To use the prefix '__Host-' you must define a domain.`);
        }
        if (cookie.path !== '/') {
          return reject(`${this.prefix} To use the prefix '__Host-' you must set path to '/'.`);
        }
      }
      if (cookie.sameSite === 'None' && !cookie.secure) {
        return reject(`${this.prefix} To define 'SameSite=None' you must set the attribute 'secure' to true.`);
      }
      if (cookie.expire && cookie.expire <= 0) {
        return reject(`${this.prefix} Cannot use a negative expiration date.`);
      }
      resolve();
    });
  }

}

export * from './cookie.type';
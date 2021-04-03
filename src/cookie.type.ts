export type DocumentCookie = {
  key: string;
  value: string;
}

export type Cookie = {

  /**
   * - __Secure- prefix: Cookies names starting with __Secure- must be set with the secure flag from a secure page (HTTPS).
   *
   * - __Host- prefix: Cookies with names starting with __Host- must be set with the secure flag, must be from a secure page (HTTPS), must not have a domain specified (and therefore aren't sent to subdomains) and the path must be /.
   */
  prefix?: '__Secure-' | '__Host-';

  /**
   * If unspecified, the cookie becomes a session cookie. A session finishes when the client shuts down, and session cookies will be removed.
   * if a number is given, the value must be in milliseconds
   * @default 'Session'
   */
  expire?: number | 'Session';

  /**
   * If omitted, defaults to the host of the current document URL, not including subdomains.
   */
  domain?: string;

  /**
   * The path must start with '/' and must exist in your site.
   * @default '/'
   */
  path?: string;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#Secure
   */
  secure?: boolean;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#HttpOnly
   */
  httpOnly?: boolean;

  /**
   * if 'None' is defined, you will set the 'secure' attribute to true.
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
   */
  sameSite?: 'Strict' | 'Lax' | 'None';
} & DocumentCookie;
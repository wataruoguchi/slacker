const NodeCache = require("node-cache");
const fs = require("fs");
import { stringifyOptions } from "./utils";
const DATE_KEY = "dates";

export class CacheManager {
  private _nodeCache: any;
  private _isReady: boolean = false;
  private _pathToCacheFile: string;
  constructor(token: string) {
    if (!token || !token.length)
      throw new Error(
        "SLACK_TOKEN is required in order to cache multiple workspaces' data."
      );
    this._nodeCache = new NodeCache(token.slice(-4));
    this._pathToCacheFile = `.cache.${token.slice(-4)}.json`;

    /**
     * The "set" event listener.
     * This will store unix time when a key is added.
     * Example: when 'users' is added...
     *
     * {
     *   "users": [ ... ],
     *   "dates": {
     *     "users": 1605587813
     *   }
     * }
     */
    this._nodeCache.on("set", (key: string) => {
      // Prevent infinity loop.
      if (key === DATE_KEY) return;

      const dates = this.get(DATE_KEY) || {};
      dates[key] = Math.round(new Date().getTime() / 1000);
      this.set(DATE_KEY, dates);
      return;
    });
    this._nodeCache.on("del", (key: string) => {
      if (key === DATE_KEY) return;
      const dates = this.get(DATE_KEY) || {};
      if (dates[key]) {
        delete dates[key];
      }
      this.set(DATE_KEY, dates);
    });
  }

  public init(): boolean {
    try {
      if (fs.existsSync(this._pathToCacheFile)) {
        const cachedString = fs.readFileSync(this._pathToCacheFile);
        const cached = JSON.parse(cachedString);
        Object.keys(cached)
          .filter((key) => key !== DATE_KEY)
          .forEach((key) => {
            this.set(key, cached[key]);
          });
        this.set(DATE_KEY, cached[DATE_KEY]);
      } else {
        fs.appendFileSync(this._pathToCacheFile);
      }
      this._isReady = true;
    } catch (err) {
      this._isReady = false;
    }
    return this._isReady;
  }

  public isReady() {
    return this._isReady;
  }

  public save(): boolean {
    try {
      fs.writeFileSync(
        this._pathToCacheFile,
        JSON.stringify(
          this._nodeCache.keys().reduce((acc, key) => {
            acc[key] = this.get(key);
            return acc;
          }, {})
        )
      );
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * The basic method. Recommended using `cache` for most of cases.
   * @param key
   * @param value
   */
  public set(key: string, value: any) {
    this._nodeCache.set(key, value);
  }

  /**
   * The basic method. Recommended using `cache` for most of cases.
   * @param key
   */
  public get(key: string): any {
    return this._nodeCache.get(key);
  }

  public async fetch(key: string, fetchData: Function): Promise<any> {
    let result = this.get(key);
    if (result) {
      console.log("has cache of " + key);
      return result;
    }
    result = await fetchData();
    this.set(key, result);
    return result;
  }

  /**
   * @param key cache key = method name. e.g., conversations.history.
   */
  public buildCacheKey(key: string, options?: object): string {
    const defaultCacheKeys = [key];
    return (options && Object.keys(options).length
      ? [...defaultCacheKeys, stringifyOptions(options)]
      : defaultCacheKeys
    ).join("-");
  }

  /**
   * @param key Optional. cache key = method name. e.g., conversations.history. If this is not set, bust all caches.
   */
  public bustCache(key?: string) {
    const allKeys = this._nodeCache.keys();
    const keys: string[] = key ? [key] : allKeys;
    this._nodeCache.del(keys);
    console.log(
      `${
        keys.length === 1 ? keys[0] + " has" : keys.length + " keys have"
      } been deleted.`
    );
    this.save();
  }

  /**
   * Get cached dates (Unix time).
   * Available for viewing what data is cached and when.
   */
  public getCacheDates() {
    return this.get(DATE_KEY) || {};
  }
}

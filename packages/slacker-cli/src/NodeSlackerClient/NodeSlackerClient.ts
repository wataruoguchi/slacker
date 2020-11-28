import {
  SlackerClient,
  WebAPICallOptions,
  PaginatePredicate,
  WebAPICallResult,
  WebClientOptions,
  LogLevel,
} from "slacker-core";
import { CacheManager } from "../CacheManager";

export { LogLevel };

export class NodeSlackerClient extends SlackerClient {
  public cacheManager: CacheManager;
  constructor(
    token: string,
    options?: WebClientOptions & { isDryRun?: boolean }
  ) {
    if (typeof options.isDryRun === "undefined") options.isDryRun = true;
    super(token, options);
    this.cacheManager = new CacheManager(token);
    this.cacheManager.init();
  }
  public async getList(
    method: string,
    options?: WebAPICallOptions,
    stopFunction?: PaginatePredicate
  ): Promise<WebAPICallResult[]> {
    const key = this.cacheManager.buildCacheKey(method, options);
    const list = await this.cacheManager.fetch(key, async () => {
      const { list } = await super.fetchList(method, options, stopFunction);
      return list;
    });
    return list;
  }
  public save() {
    this.cacheManager.save();
  }
}

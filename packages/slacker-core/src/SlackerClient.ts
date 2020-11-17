import {
  WebClient,
  WebClientOptions,
  LogLevel,
  WebAPICallResult,
  WebAPICallOptions,
  PaginatePredicate,
} from "@slack/web-api";

import { listAttributes } from "./listAttributes";

export class SlackerClient extends WebClient {
  constructor(token: string, options?: WebClientOptions) {
    const defaultOptions = {
      logLevel: LogLevel.DEBUG,
    };
    super(token, {
      ...defaultOptions,
      ...options,
    });
  }

  private async _paginate(
    method: string,
    options?: WebAPICallOptions,
    stopFunction: PaginatePredicate = function () {
      return false;
    }
  ): Promise<WebAPICallResult[]> {
    const pages = [];
    for await (const page of this.paginate(method, options)) {
      pages.push(page);
      if (stopFunction(page)) {
        break;
      }
    }
    return pages;
  }

  /**
   * https://github.com/slackapi/node-slack-sdk/blob/c379711831e7077762fcbec016788b9b0bee49f1/packages/web-api/README.md#pagination
   * @param method e.g., conversations.history
   * @param options
   * @param stopFunction `result` - pages we fetched. `page` - the last page we fetched.
   * @returns Promise<{list, responses}>
   */
  public async fetchList(
    method: string,
    options?: WebAPICallOptions,
    stopFunction?: PaginatePredicate
  ): Promise<{ list: any[]; responses: WebAPICallResult[] }> {
    const listAttributeName: string = listAttributes.get(method);
    if (!listAttributeName)
      throw new Error(
        `Endpoint ${method} was not found in 'listAttributes.ts'. The file needs to be maintained.`
      );

    // It should have all responses.
    const responses: WebAPICallResult[] = await this._paginate(
      method,
      options,
      stopFunction
    );

    /**
     * We're interested in only page[listAttributeName].
     * For example, if the method is `conversations.list`, the information we want to fetch as a list is `members`
     */
    const list = responses.reduce(function (acc = [], page) {
      if (!page[listAttributeName]) {
        throw new Error(
          `No such attribute: ${listAttributeName} - This is the app's fault. Please create an issue. - response: ${JSON.stringify(
            page
          )}`
        );
      }
      return acc.concat(page[listAttributeName]);
    }, []);
    // Returning list and raw data.
    return { list, responses };
  }
}

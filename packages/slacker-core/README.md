# `slacker-core`

The very thin wrapper of `WebClient` from [@slack/web-api](https://www.npmjs.com/package/@slack/web-api).

## What's different

It has a built-in paginate function that returns all request's result as an array.

## Warning

The pagination feature only supports the following requests:

- conversations.list
- conversations.history
- users.list

They are stored in `src/listAttributes.ts`
